/**
 * Represents a puzzle with various properties and clues.
 */
export interface Puzzle {
  catalogue: string
  title: string
  author: string
  copyright: string
  difficulty?: 'easy' | 'medium' | 'hard'
  width: number
  height: number
  clues: Clues
}

/**
 * Represents the clues for a puzzle, organized by rows and columns.
 */
export interface Clues {
  rows: RowOrColumnClues
  cols: RowOrColumnClues
}

/**
 * Represents a clue row or column in a picross puzzle.
 * It is an array of arrays, where each inner array represents a group of consecutive filled cells.
 * The numbers in the inner arrays represent the lengths of the filled cell groups.
 * For example, [[2, 1], [3], [1, 2]] represents a clue row or column with three groups of filled cells:
 * - The first group has 2 filled cells, followed by 1 filled cell.
 * - The second group has 3 filled cells.
 * - The third group has 1 filled cell, followed by 2 filled cells.
 */
export type RowOrColumnClues = number[][]

/**
 * Represents a parser for a puzzle, with a method to parse a string input into a Puzzle.
 */
export interface Parser {
  puzzle: Puzzle

  /**
   * Parses a string input into a Puzzle.
   * @param input - The string to parse.
   * @throws {Error} If the input cannot be parsed into a Puzzle.
   * @returns The parsed Puzzle.
   */
  parse: (input: string) => Puzzle
}

/**
 * Represents the types of cells in a picross grid.
 */
export enum CellTypes {
  Empty,
  Fill,
  Cross,
  Circle,
}
