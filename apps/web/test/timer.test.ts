import type { SolveResult } from '@picross/core'
import { CellTypes } from '@picross/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Timer from '../app/components/Puzzle/Timer.vue'
import { flushUi, mountPuzzleComponent } from './test-utils'

function createDeferredPromise<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  return { promise, resolve, reject }
}

function getButtonByText(container: Element, label: string) {
  return Array.from(container.querySelectorAll('button'))
    .find(button => button.textContent?.includes(label))
}

describe('timer.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows elapsed time and resets visible timer state on reset', async () => {
    const { puzzleDomain, wrapper } = mountPuzzleComponent(Timer)

    puzzleDomain.setCell(0, 0, CellTypes.Fill)
    expect(wrapper.text()).toContain('00:00:00')

    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.text()).toContain('00:00:02')

    getButtonByText(wrapper.element, 'Reset')?.click()
    await flushUi()

    expect(wrapper.text()).toContain('00:00:00')
    expect(puzzleDomain.getCell(0, 0)).toBe(CellTypes.Empty)
  })

  it('shows solve progress, disables controls while busy, and clears timeout feedback on reset', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })

    const deferred = createDeferredPromise<SolveResult>()
    const solvePuzzleModule = await import('../app/utils/solver-runner')
    vi.spyOn(solvePuzzleModule, 'solvePuzzle').mockReturnValue(deferred.promise)

    const { puzzleSolver, wrapper } = mountPuzzleComponent(Timer)
    const solveButton = getButtonByText(wrapper.element, 'Solve')
    const resetButton = getButtonByText(wrapper.element, 'Reset')
    const select = wrapper.get('select')

    solveButton?.click()
    await flushUi()

    expect(puzzleSolver.isSolving).toBe(true)
    expect(solveButton?.hasAttribute('disabled')).toBe(true)
    expect(select.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Solving in progress.')

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

    expect(wrapper.text()).toContain('Timed out on this preset')

    resetButton?.click()
    await flushUi()

    expect(puzzleSolver.solverTimedOut).toBe(false)
    expect(wrapper.text()).not.toContain('Timed out on this preset')
  })

  it('switches puzzles through the rendered select control', async () => {
    const { puzzleDomain, puzzleUi, wrapper } = mountPuzzleComponent(Timer)
    const select = wrapper.get('select')

    puzzleUi.setPointLocation(4, 4)
    await select.setValue('1')

    expect(puzzleDomain.currentPuzzleIndex).toBe(1)
    expect(puzzleUi.row).toBe(0)
    expect(puzzleUi.col).toBe(0)
  })
})
