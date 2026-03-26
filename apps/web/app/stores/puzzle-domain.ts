import type { Puzzle } from '@picross/shared'
import { Game } from '@picross/core'
import { CellTypes, sample } from '@picross/shared'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cloneGrid, clonePuzzleClues, createEmptyGrid, formatDifficulty, isBoardSolved, normalizeSolvedGrid } from '../utils/puzzle'

interface PuzzleChoice {
  index: number
  label: string
}

export const usePuzzleDomainStore = defineStore('puzzle-domain', () => {
  const catalogue = ref('')
  const title = ref('')
  const author = ref('')
  const copyright = ref('')
  const width = ref(0)
  const height = ref(0)
  const clues = ref<Puzzle['clues']>({ rows: [], cols: [] })
  const grid = ref<number[][]>([])
  const solution = ref<number[][]>([])
  const currentPuzzleIndex = ref(0)

  const puzzleChoices = computed<PuzzleChoice[]>(() => {
    return sample.map((puzzle, index) => ({
      index,
      label: `${formatDifficulty(puzzle.difficulty).charAt(0)}${index + 1} ${puzzle.title || puzzle.catalogue}`,
    }))
  })

  const isWin = computed(() => isBoardSolved(grid.value, clues.value))

  function applyGame(game: Game) {
    catalogue.value = game.puzzle.catalogue
    title.value = game.puzzle.title
    author.value = game.puzzle.author
    copyright.value = game.puzzle.copyright
    width.value = game.puzzle.width
    height.value = game.puzzle.height
    clues.value = clonePuzzleClues(game.puzzle)
    grid.value = cloneGrid(game.grid)
    solution.value = cloneGrid(game.solution)
  }

  function reset(puzzle?: Puzzle) {
    const game = puzzle ? new Game(puzzle) : new Game()
    applyGame(game)
  }

  function initialize() {
    if (width.value > 0)
      return

    selectPuzzle(0)
  }

  function replaceGrid(nextGrid: number[][]) {
    grid.value = cloneGrid(nextGrid)
  }

  function setSolution(nextSolution: number[][]) {
    solution.value = normalizeSolvedGrid(nextSolution)
  }

  function resetBoard(nextGrid?: number[][]) {
    grid.value = nextGrid ? cloneGrid(nextGrid) : createEmptyGrid(height.value, width.value)
  }

  function setCell(row: number, col: number, type: CellTypes) {
    const rowCells = grid.value[row]
    if (!rowCells || rowCells[col] === undefined)
      return

    rowCells[col] = rowCells[col] === type ? CellTypes.Empty : type
  }

  function getCell(row: number, col: number): CellTypes {
    return (grid.value[row]?.[col] ?? CellTypes.Empty) as CellTypes
  }

  function selectPuzzle(index: number) {
    const nextPuzzle = sample[index]
    if (!nextPuzzle)
      return

    currentPuzzleIndex.value = index
    reset(nextPuzzle)
  }

  return {
    author,
    catalogue,
    clues,
    copyright,
    currentPuzzleIndex,
    getCell,
    grid,
    height,
    initialize,
    isWin,
    puzzleChoices,
    replaceGrid,
    reset,
    resetBoard,
    selectPuzzle,
    setCell,
    setSolution,
    solution,
    title,
    width,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePuzzleDomainStore, import.meta.hot))
