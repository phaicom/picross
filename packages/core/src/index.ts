import type { Puzzle } from '@picross/shared'
import type { SolverStatus } from './solver'
import { SimpleSolver } from './solver'

export * from './solver'

export class Game {
  puzzle: Puzzle
  grid: number[][]
  solution: number[][]
  solveSteps: number[][][]
  solverStatus: SolverStatus

  constructor(puzzle?: Puzzle) {
    this.puzzle = {
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

    this.grid = []
    this.solution = []
    this.solveSteps = []
    this.solverStatus = 'stalled'

    if (puzzle)
      this.setPuzzle(puzzle)
  }

  reset() {
    this.puzzle = {
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

    this.grid = []
    this.solution = []
    this.solveSteps = []
    this.solverStatus = 'stalled'
  }

  setPuzzle(puzzle: Puzzle) {
    // set puzzle
    this.puzzle = puzzle
    // generate grid base on width and height
    this.grid = Array.from({ length: this.puzzle.height }, () => Array.from({ length: this.puzzle.width }, () => 0))

    // generate solution base on puzzle clues
    // solver function goes here
    const solver = new SimpleSolver(this.puzzle.clues, { autoSolve: false })
    const result = solver.solve()
    this.solution = result.board
    this.solveSteps = result.solveSteps
    this.solverStatus = result.status
  }
}
