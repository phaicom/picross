import type { Clues, Puzzle } from '@picross/shared'
import { Game } from '@picross/core'

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

  let interval: NodeJS.Timeout | null = null

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

  function reset(puzzle: Puzzle = {} as Puzzle) {
    const game = new Game(puzzle)
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
    isStartSolver.value = false
  }

  function resetBoard(g: number[][] = []) {
    grid.splice(0, grid.length)
    const empty = Array.from({ length: height.value }, () => Array.from({ length: width.value }, () => 0))
    grid.push(...(g.length > 0 ? g : empty))
  }

  function startSolver() {
    clearInterval(interval as NodeJS.Timeout)
    let counter = -1
    isStartSolver.value = true
    resetBoard()
    interval = setInterval(() => {
      counter += 1
      resetBoard(solveSteps[counter])
      if (counter === solveSteps.length - 1) {
        resetBoard(trimGrid(grid))
        clearInterval(interval as NodeJS.Timeout)
        isStartSolver.value = false
      }
    }, 300)
  }

  function trimGrid(g: number[][]): number[][] {
    return g.map(row => row.map(col => col === 1 ? 1 : 0))
  }

  onUnmounted(() => {
    if (interval)
      clearInterval(interval)
  })

  return { catalogue, title, author, width, height, clues, grid, solution, solveSteps, isStartSolver, isWin, reset, resetBoard, startSolver }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePuzzleStore, import.meta.hot))
