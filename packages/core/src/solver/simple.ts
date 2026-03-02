import type { Clues, RowOrColumnClues } from '@picross/shared'
import { combination, range } from '@picross/shared'
import { uniq, zip } from 'lodash-es'

export type SolverStatus = 'solved' | 'stalled' | 'invalid'

export interface SolveOptions {
  maxIterations?: number
}

export interface SolverInitOptions extends SolveOptions {
  autoSolve?: boolean
}

export interface SolveResult {
  board: number[][]
  solveSteps: number[][][]
  solved: boolean
  status: SolverStatus
  iterations: number
}

/**
 * The SimpleSolver class represents a solver for a picross puzzle.
 * It uses a simple algorithm to fill in the cells of the puzzle based on the given clues.
 */
export class SimpleSolver {
  clues: Clues
  rowsDone: number[]
  colsDone: number[]
  solved: boolean
  board: number[][]
  solveSteps: number[][][]
  status: SolverStatus

  /**
   * Creates an instance of the SimpleSolver class.
   * @param clues - The clues object containing the row and column clues.
   */
  constructor(clues: Clues, options: SolverInitOptions = {}) {
    this.clues = clues
    const numRows = clues.rows.length
    const numCols = clues.cols.length
    this.rowsDone = Array.from({ length: numRows }, () => 0)
    this.colsDone = Array.from({ length: numCols }, () => 0)
    this.solved = false
    this.board = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0))
    this.solveSteps = []
    this.status = 'stalled'

    if (options.autoSolve ?? true)
      this.solve(options)
  }

  solve(options: SolveOptions = {}): SolveResult {
    this.initializeState()

    const numRows = this.clues.rows.length
    const numCols = this.clues.cols.length

    const rowsPoss = this.createPossibilities(this.clues.rows, numCols)
    const colsPoss = this.createPossibilities(this.clues.cols, numRows)

    if (this.hasInvalidPossibilities(rowsPoss) || this.hasInvalidPossibilities(colsPoss)) {
      this.status = 'invalid'
      return this.createResult(0)
    }

    const maxIterations = options.maxIterations ?? Math.max(numRows * numCols * 4, 1)
    let iterations = 0

    while (!this.solved && iterations < maxIterations) {
      iterations += 1
      let madeProgress = false
      const lowestRow = this.selectIndexNotDone(rowsPoss, 1)
      const lowestCol = this.selectIndexNotDone(colsPoss, 0)
      const lowest = [...lowestRow, ...lowestCol].sort((a, b) => a[1] - b[1])

      for (const [i, _, isRow] of lowest) {
        if (this.checkDone(isRow, i))
          continue

        const poss = isRow ? rowsPoss[i] : colsPoss[i]
        if (!poss || poss.length === 0) {
          this.status = 'invalid'
          return this.createResult(iterations)
        }

        const uniqueOptions = this.getOnlyOneOption(poss)

        for (const [j, val] of uniqueOptions) {
          const [rowIndex, colIndex] = isRow ? [i, j] : [j, i]
          const row = this.board[rowIndex]
          if (!row)
            continue

          const current = row[colIndex]
          if (current === undefined)
            continue

          if (current === 0) {
            row[colIndex] = val
            madeProgress = true

            if (isRow) {
              const colPoss = colsPoss[colIndex]
              if (!colPoss) {
                this.status = 'invalid'
                return this.createResult(iterations)
              }
              colsPoss[colIndex] = this.removePossibilities(colPoss, rowIndex, val)
              if (colsPoss[colIndex].length === 0) {
                this.status = 'invalid'
                return this.createResult(iterations)
              }
            }
            else {
              const rowPoss = rowsPoss[rowIndex]
              if (!rowPoss) {
                this.status = 'invalid'
                return this.createResult(iterations)
              }
              rowsPoss[rowIndex] = this.removePossibilities(rowPoss, colIndex, val)
              if (rowsPoss[rowIndex].length === 0) {
                this.status = 'invalid'
                return this.createResult(iterations)
              }
            }
          }
        }

        this.updateDone(isRow, i)
        this.solveSteps.push(this.board.map(row => row.map(cell => (cell === -1 ? 2 : cell))))
      }

      this.board = this.board.map(row => row.map(cell => (cell === -1 ? 0 : cell)))
      this.checkSolved()

      if (!madeProgress)
        break
    }

    this.status = this.solved ? 'solved' : 'stalled'
    return this.createResult(iterations)
  }

  /**
   * Creates possibilities for a given number of empty cells, groups, and ones.
   *
   * @param numEmpty - The number of empty cells.
   * @param groups - The number of groups.
   * @param ones - An array of arrays representing the ones.
   * @returns An array of arrays representing the possibilities.
   */
  private _createPossibilities(numEmpty: number, groups: number, ones: number[][]): number[][] {
    const result: number[][] = []
    const combinations = combination(Array.from(range(0, groups + numEmpty)), groups)

    for (const combination of combinations) {
      const selected = Array.from({ length: groups + numEmpty }, () => -1)
      let onesIdx = 0
      for (const val of combination) {
        selected[val] = onesIdx
        onesIdx += 1
      }
      const modifiedSelected = selected
        .map((val) => {
          if (val <= -1)
            return [-1]

          const one = ones[val]
          if (!one)
            throw new Error('Invalid possibility index')

          return [...one, -1]
        })
        .reduce((acc, val) => acc.concat(val), [])
        .slice(0, -1)
      result.push(modifiedSelected)
    }

    return result
  }

  /**
   * Creates possibilities for each line in the given ClueRowOrColumn array.
   *
   * @param lines - The RowOrColumnClues array representing the lines.
   * @param numLines - The total number of lines.
   * @returns An array of possibilities for each line.
   */
  private createPossibilities(lines: RowOrColumnClues, numLines: number): number[][][] {
    return lines.map((line) => {
      const groups = line.length
      const numEmpty = numLines - line.reduce((a, b) => a + b, 0) - groups + 1
      const ones = line.map(cell => Array.from({ length: cell }, () => 1))

      if (numEmpty < 0)
        return []

      return this._createPossibilities(numEmpty, groups, ones)
    })
  }

  /**
   * Selects the indices of the possibilities array that are not marked as done.
   *
   * @param poss - The array of possibilities.
   * @param index - The index value.
   * @returns An array of tuples containing the index, length, and index value for each possibility that is not marked as done.
   */
  private selectIndexNotDone(poss: number[][][], index: 0 | 1): Array<[number, number, 0 | 1]> {
    const lengths = poss.map(p => p.length)
    const doneArray = index ? this.rowsDone : this.colsDone
    return lengths.map((length, i) => [i, length, index] as [number, number, 0 | 1]).filter((_, i) => doneArray[i] === 0)
  }

  /**
   * Checks if a row or column is marked as done.
   *
   * @param row - The row or column index.
   * @param index - The index of the row or column.
   * @returns `true` if the row or column is marked as done, `false` otherwise.
   */
  private checkDone(row: 0 | 1, index: number): boolean {
    return row ? this.rowsDone[index] === 1 : this.colsDone[index] === 1
  }

  /**
   * Returns an array of coordinates and their corresponding unique values
   * where there is only one possible option in each column of the given 2D array.
   *
   * @param vals - The 2D array of numbers.
   * @returns An array of coordinates and their corresponding unique values.
   */
  private getOnlyOneOption(vals: number[][]): Array<[number, number]> {
    const transposedVals = zip(...vals)
    return transposedVals.flatMap((i, n): Array<[number, number]> => {
      const uniqueVals = uniq(i)
      const uniqueVal = uniqueVals[0]
      if (uniqueVals.length === 1 && uniqueVal !== undefined)
        return [[n, uniqueVal]]

      return []
    })
  }

  /**
   * Removes possibilities from the given array based on the specified index and value.
   * @param poss - The array of possibilities.
   * @param index - The index to check in each possibility.
   * @param val - The value to compare against in each possibility.
   * @returns A new array with possibilities that have the specified value at the specified index.
   */
  private removePossibilities(poss: number[][], index: number, val: number): number[][] {
    return poss.filter(p => p[index] === val)
  }

  /**
   * Updates the state of the board to mark a row or column as done if all its values are non-zero.
   *
   * @param isRow - A flag indicating whether the update is for a row (true) or a column (false).
   * @param index - The index of the row or column to update.
   */
  private updateDone(isRow: 0 | 1, index: number): void {
    let values: number[]

    if (isRow) {
      const row = this.board[index]
      if (!row)
        return
      values = row
    }
    else {
      const colValues = this.board.map(row => row[index])
      if (colValues.includes(undefined))
        return
      values = colValues as number[]
    }

    if (!values.includes(0)) {
      if (isRow)
        this.rowsDone[index] = 1
      else
        this.colsDone[index] = 1
    }
  }

  /**
   * Checks if the puzzle is solved by verifying if all rows and columns are marked as done.
   */
  private checkSolved(): void {
    if (!this.solved && this.rowsDone.every(done => done === 1) && this.colsDone.every(done => done === 1))
      this.solved = true
  }

  private initializeState(): void {
    const numRows = this.clues.rows.length
    const numCols = this.clues.cols.length
    this.rowsDone = Array.from({ length: numRows }, () => 0)
    this.colsDone = Array.from({ length: numCols }, () => 0)
    this.solved = false
    this.status = 'stalled'
    this.board = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0))
    this.solveSteps = []
  }

  private hasInvalidPossibilities(possibilities: number[][][]): boolean {
    return possibilities.some(group => group.length === 0)
  }

  private createResult(iterations: number): SolveResult {
    return {
      board: this.board.map(row => [...row]),
      solveSteps: this.solveSteps.map(step => step.map(row => [...row])),
      solved: this.solved,
      status: this.status,
      iterations,
    }
  }
}
