import type { SolveOptions, SolverStatus } from '@picross/core'
import type { Clues, Puzzle } from '@picross/shared'
import { Game, SimpleSolver } from '@picross/core'
import { sample } from '@picross/shared'

type SolverPreset = 'fast' | 'normal' | 'deep'
type Difficulty = NonNullable<Puzzle['difficulty']>

interface PuzzleChoice {
  index: number
  label: string
}

export const usePuzzleStore = defineStore('puzzle', () => {
  const catalogue = ref('')
  const title = ref('')
  const author = ref('')
  const copyright = ref('')
  const width = ref(0)
  const height = ref(0)
  const clues = reactive<Clues>({ rows: [], cols: [] })
  const grid = reactive<number[][]>([])
  const solution = reactive<number[][]>([])
  const solveSteps = reactive<number[][][]>([])
  const isStartSolver = ref(false)
  const solverPreset = ref<SolverPreset>('normal')
  const solverStatus = ref<SolverStatus>('stalled')
  const solverTimedOut = ref(false)
  const currentPuzzleIndex = ref(0)
  const puzzleChoices = computed<PuzzleChoice[]>(() => {
    return sample.map((p, index) => ({
      index,
      label: `${formatDifficulty(p.difficulty).charAt(0)}${index + 1} ${p.title || p.catalogue}`,
    }))
  })

  let interval: ReturnType<typeof setInterval> | null = null

  function clearSolverInterval() {
    if (!interval)
      return
    clearInterval(interval)
    interval = null
  }

  const isWin = computed(() => {
    if (!grid.length || !solution.length)
      return false

    if (grid.length !== solution.length)
      return false

    for (let row = 0; row < grid.length; row += 1) {
      const gridRow = grid[row]
      const solutionRow = solution[row]
      if (!gridRow || !solutionRow || gridRow.length !== solutionRow.length)
        return false

      for (let col = 0; col < gridRow.length; col += 1) {
        const normalized = gridRow[col] === 1 ? 1 : 0
        if (normalized !== solutionRow[col])
          return false
      }
    }

    return true
  })

  function reset(puzzle?: Puzzle) {
    clearSolverInterval()
    const game = puzzle ? new Game(puzzle) : new Game()
    catalogue.value = game.puzzle.catalogue
    title.value = game.puzzle.title
    author.value = game.puzzle.author
    copyright.value = game.puzzle.copyright
    width.value = game.puzzle.width
    height.value = game.puzzle.height
    clues.rows.splice(0, clues.rows.length)
    clues.cols.splice(0, clues.cols.length)
    clues.rows.push(...game.puzzle.clues.rows)
    clues.cols.push(...game.puzzle.clues.cols)
    grid.splice(0, grid.length)
    grid.push(...game.grid)
    solution.splice(0, solution.length)
    solution.push(...game.solution)
    solveSteps.splice(0, solveSteps.length)
    solveSteps.push(...game.solveSteps)
    solverStatus.value = game.solverStatus
    solverTimedOut.value = false
    isStartSolver.value = false
  }

  function stopSolver() {
    clearSolverInterval()
    isStartSolver.value = false
  }

  function initialize() {
    if (width.value > 0)
      return

    selectPuzzle(0)
  }

  function resetBoard(g: number[][] = []) {
    grid.splice(0, grid.length)
    const empty = Array.from({ length: height.value }, () => Array.from({ length: width.value }, () => 0))
    grid.push(...(g.length > 0 ? g : empty))
  }

  function startSolver() {
    solveByPreset()

    if (!solveSteps.length) {
      isStartSolver.value = false
      resetBoard(trimGrid(solution))
      return
    }

    clearSolverInterval()

    let counter = -1
    isStartSolver.value = true
    resetBoard()
    interval = setInterval(() => {
      counter += 1
      resetBoard(solveSteps[counter])
      if (counter === solveSteps.length - 1) {
        resetBoard(trimGrid(grid))
        clearSolverInterval()
        isStartSolver.value = false
      }
    }, 300)
  }

  function setSolverPreset(preset: SolverPreset) {
    solverPreset.value = preset
  }

  function selectPuzzle(index: number) {
    const next = sample[index]
    if (!next)
      return

    currentPuzzleIndex.value = index
    reset(next)
  }

  function solveByPreset() {
    const options = getPresetOptions(solverPreset.value)
    const solver = new SimpleSolver({
      rows: clues.rows.map(row => [...row]),
      cols: clues.cols.map(col => [...col]),
    }, { autoSolve: false })
    const result = solver.solve(options)

    solution.splice(0, solution.length)
    solution.push(...result.board)
    solveSteps.splice(0, solveSteps.length)
    solveSteps.push(...result.solveSteps)
    solverStatus.value = result.status
    solverTimedOut.value = result.timedOut
  }

  function getPresetOptions(preset: SolverPreset): SolveOptions {
    const area = Math.max(width.value * height.value, 1)
    switch (preset) {
      case 'fast':
        return {
          backtracking: true,
          maxIterations: Math.max(area * 3, 64),
          maxBacktrackNodes: Math.max(area * 8, 256),
          timeoutMs: 120,
          maxRecordedSteps: 80,
        }
      case 'deep':
        return {
          backtracking: true,
          maxIterations: Math.max(area * 12, 512),
          maxBacktrackNodes: Math.max(area * 400, 20000),
          timeoutMs: 5000,
          maxRecordedSteps: 240,
        }
      default:
        return {
          backtracking: true,
          maxIterations: Math.max(area * 6, 256),
          maxBacktrackNodes: Math.max(area * 64, 4096),
          timeoutMs: 1000,
          maxRecordedSteps: 140,
        }
    }
  }

  function trimGrid(g: number[][]): number[][] {
    return g.map(row => row.map(col => col === 1 ? 1 : 0))
  }

  function formatDifficulty(difficulty?: Puzzle['difficulty']): string {
    const level: Difficulty = difficulty ?? 'medium'
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  onUnmounted(() => {
    clearSolverInterval()
  })

  return {
    catalogue,
    title,
    author,
    width,
    height,
    clues,
    grid,
    solution,
    solveSteps,
    isStartSolver,
    isWin,
    solverPreset,
    solverStatus,
    solverTimedOut,
    currentPuzzleIndex,
    puzzleChoices,
    reset,
    initialize,
    resetBoard,
    stopSolver,
    startSolver,
    setSolverPreset,
    selectPuzzle,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePuzzleStore, import.meta.hot))
