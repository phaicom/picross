import type { Parser, Puzzle } from '@picross/shared'

/**
 * Represents a base parser for parsing picross puzzles.
 */
export class BaseParser implements Parser {
  puzzle: Puzzle

  constructor() {
    this.puzzle = this.createEmptyPuzzle()
  }

  protected createEmptyPuzzle(): Puzzle {
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

  protected resetPuzzle(): void {
    this.puzzle = this.createEmptyPuzzle()
  }

  parse(_: string) {
    return this.puzzle
  }
}
