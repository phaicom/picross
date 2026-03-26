import { CellTypes } from '@picross/shared'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePuzzleDomainStore } from '../app/stores/puzzle-domain'
import { usePuzzleSolverStore } from '../app/stores/puzzle-solver'
import { usePuzzleUiStore } from '../app/stores/puzzle-ui'
import { disposeSolverWorker } from '../app/utils/solver-runner'

describe('puzzle flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    disposeSolverWorker()
  })

  it('loads a puzzle, allows interaction, solves, and finishes on the solved board', async () => {
    vi.useFakeTimers()

    const puzzleDomain = usePuzzleDomainStore()
    const puzzleSolver = usePuzzleSolverStore()
    const puzzleUi = usePuzzleUiStore()

    puzzleDomain.initialize()
    expect(puzzleDomain.title).toBe('Starter Cross')

    puzzleUi.setCellType(CellTypes.Fill)
    puzzleDomain.setCell(0, 0, puzzleUi.cellType)
    expect(puzzleDomain.getCell(0, 0)).toBe(CellTypes.Fill)

    const solvePromise = puzzleSolver.startSolver()
    await vi.runAllTimersAsync()
    await solvePromise

    expect(puzzleSolver.solverStatus).toBe('solved')
    expect(puzzleDomain.grid).toEqual(puzzleDomain.solution)
    expect(puzzleDomain.isWin).toBe(true)
  })

  it('applies the authoritative solver board after playback even when the last frame is partial', async () => {
    vi.useFakeTimers()

    const puzzleDomain = usePuzzleDomainStore()
    const puzzleSolver = usePuzzleSolverStore()

    puzzleDomain.initialize()

    const solvePuzzleModule = await import('../app/utils/solver-runner')
    vi.spyOn(solvePuzzleModule, 'solvePuzzle').mockResolvedValue({
      board: [
        [1, 0],
        [0, 1],
      ],
      solveSteps: [
        [
          [1, 0],
          [0, 0],
        ],
      ],
      solved: true,
      status: 'solved',
      iterations: 1,
      backtrackNodes: 0,
      timedOut: false,
    })

    const solvePromise = puzzleSolver.startSolver()
    await vi.runAllTimersAsync()
    await solvePromise

    expect(puzzleDomain.grid).toEqual([
      [1, 0],
      [0, 1],
    ])
  })

  it('resets the board without clearing the selected puzzle', () => {
    const puzzleDomain = usePuzzleDomainStore()

    puzzleDomain.initialize()
    puzzleDomain.setCell(0, 0, CellTypes.Fill)
    puzzleDomain.resetBoard()

    expect(puzzleDomain.currentPuzzleIndex).toBe(0)
    expect(puzzleDomain.getCell(0, 0)).toBe(CellTypes.Empty)
  })
})
