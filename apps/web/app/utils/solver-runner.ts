import type { SolveOptions, SolveResult } from '@picross/core'
import type { Clues } from '@picross/shared'
import { SimpleSolver } from '@picross/core'

interface SolveWorkerRequest {
  id: number
  clues: Clues
  options: SolveOptions
}

interface SolveWorkerResponse {
  id: number
  result: SolveResult
}

let worker: Worker | null = null
let requestId = 0
const pendingRequests = new Map<number, {
  clues: Clues
  options: SolveOptions
  resolve: (result: SolveResult) => void
  reject: (error: Error) => void
}>()

function solveOnMainThread(clues: Clues, options: SolveOptions): Promise<SolveResult> {
  return Promise.resolve().then(() => {
    const solver = new SimpleSolver({
      rows: clues.rows.map(row => [...row]),
      cols: clues.cols.map(col => [...col]),
    }, { autoSolve: false })

    return solver.solve(options)
  })
}

function handleWorkerMessage(event: MessageEvent<SolveWorkerResponse>) {
  const pending = pendingRequests.get(event.data.id)
  if (!pending)
    return

  pendingRequests.delete(event.data.id)
  pending.resolve(event.data.result)
}

function handleWorkerFailure(error: Error) {
  const waiting = [...pendingRequests.values()]
  pendingRequests.clear()
  worker?.terminate()
  worker = null

  for (const pending of waiting)
    solveOnMainThread(pending.clues, pending.options).then(pending.resolve, () => pending.reject(error))
}

function getWorker(): Worker | null {
  if (import.meta.server || typeof Worker === 'undefined')
    return null

  if (worker)
    return worker

  try {
    worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('message', handleWorkerMessage as EventListener)
    worker.addEventListener('error', event => handleWorkerFailure(new Error(event.message || 'Worker execution failed')))
    return worker
  }
  catch {
    worker = null
    return null
  }
}

export async function solvePuzzle(clues: Clues, options: SolveOptions): Promise<SolveResult> {
  const solveWorker = getWorker()
  if (!solveWorker)
    return solveOnMainThread(clues, options)

  return new Promise<SolveResult>((resolve, reject) => {
    const id = requestId
    requestId += 1
    pendingRequests.set(id, { clues, options, resolve, reject })

    const request: SolveWorkerRequest = {
      id,
      clues: {
        rows: clues.rows.map(row => [...row]),
        cols: clues.cols.map(col => [...col]),
      },
      options,
    }

    solveWorker.postMessage(request)
  })
}

export function disposeSolverWorker(): void {
  if (!worker)
    return

  worker.terminate()
  worker = null
  pendingRequests.clear()
}
