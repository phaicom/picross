import type { Puzzle } from '@picross/shared'
import type { SolverStatus } from './solver'

export * from './solver'

function createEmptyPuzzle(): Puzzle {
  return {
    catalogue: '',
    title: '',
    author: '',
    copyright: '',
    width: 0,
    height: 0,
    clues: {
      rows: [],
      cols: [],
    },
  }
}

function createEmptyGrid(height: number, width: number): number[][] {
  return Array.from({ length: height }).map(() => Array.from({ length: width }).map(() => 0))
}

export class Game {
  puzzle: Puzzle
  grid: number[][]
  solution: number[][]
  solveSteps: number[][][]
  solverStatus: SolverStatus

  constructor(puzzle?: Puzzle) {
    this.puzzle = createEmptyPuzzle()

    this.grid = []
    this.solution = []
    this.solveSteps = []
    this.solverStatus = 'stalled'

    if (puzzle)
      this.setPuzzle(puzzle)
  }

  reset() {
    this.puzzle = createEmptyPuzzle()

    this.grid = []
    this.solution = []
    this.solveSteps = []
    this.solverStatus = 'stalled'
  }

  setPuzzle(puzzle: Puzzle) {
    this.puzzle = puzzle
    this.grid = createEmptyGrid(this.puzzle.height, this.puzzle.width)
    this.solution = []
    this.solveSteps = []
    this.solverStatus = 'stalled'
  }
}
