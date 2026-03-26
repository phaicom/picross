// @vitest-environment happy-dom

import type { SolveResult } from '@picross/core'
import type { App } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import Timer from '../app/components/Puzzle/Timer.vue'
import { usePuzzleDomainStore } from '../app/stores/puzzle-domain'
import { usePuzzleSolverStore } from '../app/stores/puzzle-solver'
import { usePuzzleUiStore } from '../app/stores/puzzle-ui'

function createDeferredPromise<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  return { promise, resolve, reject }
}

async function flushUi() {
  await Promise.resolve()
  await nextTick()
}

describe('timer.vue', () => {
  let app: App<Element> | null = null
  let root: HTMLDivElement | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })

    const pinia = createPinia()
    setActivePinia(pinia)

    root = document.createElement('div')
    document.body.appendChild(root)
    app = createApp(Timer)
    app.use(pinia)
    app.mount(root)
  })

  afterEach(() => {
    app?.unmount()
    root?.remove()
    app = null
    root = null
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders elapsed time in the mounted component', async () => {
    expect(root?.textContent).toContain('00:00:00')

    await vi.advanceTimersByTimeAsync(2000)
    await flushUi()

    expect(root?.textContent).toContain('00:00:02')
  })

  it('shows pending solve feedback and clears timeout feedback after reset', async () => {
    const deferred = createDeferredPromise<SolveResult>()
    const solvePuzzleModule = await import('../app/utils/solver-runner')
    vi.spyOn(solvePuzzleModule, 'solvePuzzle').mockReturnValue(deferred.promise)

    const puzzleSolver = usePuzzleSolverStore()
    const solveButton = Array.from(root?.querySelectorAll('button') ?? []).find(button => button.textContent?.includes('Solve'))
    const resetButton = Array.from(root?.querySelectorAll('button') ?? []).find(button => button.textContent?.includes('Reset'))

    solveButton?.click()
    await flushUi()

    expect(puzzleSolver.isSolving).toBe(true)
    expect(solveButton?.hasAttribute('disabled')).toBe(true)
    expect(root?.textContent).toContain('Solving in progress.')

    deferred.resolve({
      board: [
        [1, 1, 1, 1, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [0, 0, 0, 0, 1],
      ],
      solveSteps: [],
      solved: false,
      status: 'partial',
      iterations: 2,
      backtrackNodes: 0,
      timedOut: true,
    })
    await flushUi()

    expect(root?.textContent).toContain('Timed out on this preset')

    resetButton?.click()
    await flushUi()

    expect(puzzleSolver.solverTimedOut).toBe(false)
    expect(root?.textContent).not.toContain('Timed out on this preset')
    expect(root?.textContent).toContain('00:00:00')
  })

  it('switches puzzles through the rendered select control', async () => {
    const puzzleDomain = usePuzzleDomainStore()
    const puzzleUi = usePuzzleUiStore()
    const select = root?.querySelector('select')

    puzzleUi.setPointLocation(4, 4)
    select!.value = '1'
    select!.dispatchEvent(new Event('change'))
    await flushUi()

    expect(puzzleDomain.currentPuzzleIndex).toBe(1)
    expect(puzzleUi.row).toBe(0)
    expect(puzzleUi.col).toBe(0)
  })
})
