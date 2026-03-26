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

globalThis.onmessage = (event: MessageEvent<SolveWorkerRequest>) => {
  const { id, clues, options } = event.data
  const solver = new SimpleSolver({
    rows: clues.rows.map(row => [...row]),
    cols: clues.cols.map(col => [...col]),
  }, { autoSolve: false })

  const result = solver.solve(options)
  const response: SolveWorkerResponse = { id, result }
  globalThis.postMessage(response)
}
