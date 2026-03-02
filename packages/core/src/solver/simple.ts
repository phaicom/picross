import type { Clues, RowOrColumnClues } from '@picross/shared'
import { combination, range } from '@picross/shared'

export type SolverStatus = 'solved' | 'stalled' | 'invalid'

export interface SolveOptions {
  maxIterations?: number
  backtracking?: boolean
  maxBacktrackNodes?: number
  timeoutMs?: number
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
  backtrackNodes: number
  timedOut: boolean
}

interface SolverState {
  board: number[][]
  rowsDone: number[]
  colsDone: number[]
  rowsPoss: number[][][]
  colsPoss: number[][][]
  solveSteps: number[][][]
}

interface SearchContext {
  maxIterations: number
  maxBacktrackNodes: number
  deadline: number
  iterations: number
  backtrackNodes: number
  timedOut: boolean
}

type SearchOutcome = 'solved' | 'invalid' | 'stalled'

interface SearchResult {
  outcome: SearchOutcome
  state: SolverState
}

/**
 * Deterministic picross solver with bounded backtracking fallback.
 */
export class SimpleSolver {
  clues: Clues
  rowsDone: number[]
  colsDone: number[]
  solved: boolean
  board: number[][]
  solveSteps: number[][][]
  status: SolverStatus

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
    const numRows = this.clues.rows.length
    const numCols = this.clues.cols.length
    this.initializeState()

    const rowsPoss = this.createPossibilities(this.clues.rows, numCols)
    const colsPoss = this.createPossibilities(this.clues.cols, numRows)
    const state: SolverState = {
      board: this.cloneBoard(this.board),
      rowsDone: [...this.rowsDone],
      colsDone: [...this.colsDone],
      rowsPoss,
      colsPoss,
      solveSteps: [],
    }

    if (this.hasInvalidPossibilities(rowsPoss) || this.hasInvalidPossibilities(colsPoss)) {
      this.status = 'invalid'
      this.applyFinalState(state)
      return this.createResult(0, 0, false)
    }

    const maxIterations = options.maxIterations ?? Math.max(numRows * numCols * 4, 1)
    const maxBacktrackNodes = options.maxBacktrackNodes ?? Math.max(numRows * numCols * 64, 1024)
    const timeoutMs = options.timeoutMs ?? 1000
    const context: SearchContext = {
      maxIterations,
      maxBacktrackNodes,
      deadline: Date.now() + timeoutMs,
      iterations: 0,
      backtrackNodes: 0,
      timedOut: false,
    }

    const result = this.search(state, context, options.backtracking ?? true)
    this.applyFinalState(result.state)

    if (result.outcome === 'invalid')
      this.status = 'invalid'
    else if (result.outcome === 'solved')
      this.status = 'solved'
    else
      this.status = 'stalled'

    this.solved = this.status === 'solved'
    return this.createResult(context.iterations, context.backtrackNodes, context.timedOut)
  }

  private search(state: SolverState, context: SearchContext, allowBacktracking: boolean): SearchResult {
    const propagateOutcome = this.propagate(state, context)
    if (propagateOutcome !== 'stalled')
      return { outcome: propagateOutcome, state }

    if (!allowBacktracking)
      return { outcome: 'stalled', state }

    if (context.timedOut)
      return { outcome: 'stalled', state }

    if (context.backtrackNodes >= context.maxBacktrackNodes)
      return { outcome: 'stalled', state }

    const branch = this.chooseBranch(state)
    if (!branch)
      return { outcome: 'invalid', state }

    for (const candidate of branch.candidates) {
      if (Date.now() > context.deadline) {
        context.timedOut = true
        return { outcome: 'stalled', state }
      }

      if (context.backtrackNodes >= context.maxBacktrackNodes)
        return { outcome: 'stalled', state }

      context.backtrackNodes += 1
      const child = this.cloneState(state)
      if (!this.applyAssignment(child, branch.row, branch.col, candidate))
        continue

      const searched = this.search(child, context, true)
      if (searched.outcome === 'solved')
        return searched

      if (context.timedOut)
        return { outcome: 'stalled', state }
    }

    return { outcome: 'invalid', state }
  }

  private propagate(state: SolverState, context: SearchContext): SearchOutcome {
    if (this.isSolvedBoard(state.board)) {
      this.markAllDone(state)
      return 'solved'
    }

    while (context.iterations < context.maxIterations) {
      if (Date.now() > context.deadline) {
        context.timedOut = true
        return 'stalled'
      }

      context.iterations += 1
      let madeProgress = false
      const lowestRow = this.selectIndexNotDone(state.rowsPoss, 1, state.rowsDone)
      const lowestCol = this.selectIndexNotDone(state.colsPoss, 0, state.colsDone)
      const lowest = [...lowestRow, ...lowestCol].sort((a, b) => a[1] - b[1])

      for (const [index, _, isRow] of lowest) {
        if (this.checkDone(isRow, index, state.rowsDone, state.colsDone))
          continue

        const poss = isRow ? state.rowsPoss[index] : state.colsPoss[index]
        if (!poss || poss.length === 0)
          return 'invalid'

        const uniqueOptions = this.getOnlyOneOption(poss)
        for (const [lineCellIndex, val] of uniqueOptions) {
          const [rowIndex, colIndex] = isRow ? [index, lineCellIndex] : [lineCellIndex, index]
          const assigned = this.applyAssignment(state, rowIndex, colIndex, val)
          if (!assigned)
            return 'invalid'
          madeProgress = true
        }

        this.updateDone(state, isRow, index)
        state.solveSteps.push(this.snapshotStep(state.board))
      }

      if (this.isSolvedBoard(state.board)) {
        this.markAllDone(state)
        return 'solved'
      }

      if (!madeProgress)
        return 'stalled'
    }

    return 'stalled'
  }

  private chooseBranch(state: SolverState): { row: number, col: number, candidates: number[] } | null {
    let best: { row: number, col: number, candidates: number[] } | null = null

    for (let row = 0; row < state.board.length; row += 1) {
      const cells = state.board[row]
      if (!cells)
        continue

      for (let col = 0; col < cells.length; col += 1) {
        if (cells[col] !== 0)
          continue

        const candidates = this.cellCandidates(state, row, col)
        if (candidates.length === 0)
          return null

        if (!best || candidates.length < best.candidates.length)
          best = { row, col, candidates }

        if (best.candidates.length <= 2)
          return best
      }
    }

    return best
  }

  private cellCandidates(state: SolverState, row: number, col: number): number[] {
    const rowPoss = state.rowsPoss[row]
    const colPoss = state.colsPoss[col]
    if (!rowPoss || !colPoss || rowPoss.length === 0 || colPoss.length === 0)
      return []

    const rowVals = new Set<number>()
    const colVals = new Set<number>()

    for (const possibility of rowPoss) {
      const value = possibility[col]
      if (value !== undefined)
        rowVals.add(value)
    }
    for (const possibility of colPoss) {
      const value = possibility[row]
      if (value !== undefined)
        colVals.add(value)
    }

    const intersection: number[] = []
    for (const value of rowVals) {
      if (colVals.has(value))
        intersection.push(value)
    }

    return intersection
  }

  private applyAssignment(state: SolverState, row: number, col: number, val: number): boolean {
    const rowCells = state.board[row]
    if (!rowCells)
      return false

    const current = rowCells[col]
    if (current === undefined)
      return false

    if (current === val)
      return true

    if (current !== 0 && current !== val)
      return false

    rowCells[col] = val

    const rowPoss = state.rowsPoss[row]
    const colPoss = state.colsPoss[col]
    if (!rowPoss || !colPoss)
      return false

    const nextRowPoss = this.removePossibilities(rowPoss, col, val)
    const nextColPoss = this.removePossibilities(colPoss, row, val)
    if (nextRowPoss.length === 0 || nextColPoss.length === 0)
      return false

    state.rowsPoss[row] = nextRowPoss
    state.colsPoss[col] = nextColPoss
    this.updateDone(state, 1, row)
    this.updateDone(state, 0, col)
    return true
  }

  private _createPossibilities(numEmpty: number, groups: number, ones: number[][]): number[][] {
    const result: number[][] = []
    const slots = Array.from(range(0, groups + numEmpty))

    for (const selectedSlots of combination(slots, groups)) {
      const selected = Array.from({ length: groups + numEmpty }, () => -1)
      let onesIdx = 0
      for (const val of selectedSlots) {
        selected[val] = onesIdx
        onesIdx += 1
      }
      const line: number[] = []
      for (const val of selected) {
        if (val <= -1) {
          line.push(-1)
          continue
        }

        const one = ones[val]
        if (!one)
          throw new Error('Invalid possibility index')

        line.push(...one, -1)
      }
      line.pop()
      result.push(line)
    }

    return result
  }

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

  private selectIndexNotDone(poss: number[][][], index: 0 | 1, doneArray: number[]): Array<[number, number, 0 | 1]> {
    const result: Array<[number, number, 0 | 1]> = []
    for (let i = 0; i < poss.length; i += 1) {
      if (doneArray[i] === 0)
        result.push([i, poss[i]?.length ?? 0, index])
    }
    return result
  }

  private checkDone(row: 0 | 1, index: number, rowsDone: number[], colsDone: number[]): boolean {
    return row ? rowsDone[index] === 1 : colsDone[index] === 1
  }

  private getOnlyOneOption(vals: number[][]): Array<[number, number]> {
    if (vals.length === 0)
      return []

    const width = vals[0]?.length ?? 0
    const result: Array<[number, number]> = []

    for (let col = 0; col < width; col += 1) {
      const first = vals[0]?.[col]
      if (first === undefined)
        continue

      let unique = true
      for (let row = 1; row < vals.length; row += 1) {
        if (vals[row]?.[col] !== first) {
          unique = false
          break
        }
      }

      if (unique)
        result.push([col, first])
    }

    return result
  }

  private removePossibilities(poss: number[][], index: number, val: number): number[][] {
    return poss.filter(p => p[index] === val)
  }

  private updateDone(state: SolverState, isRow: 0 | 1, index: number): void {
    if (isRow) {
      const row = state.board[index]
      if (row && !row.includes(0))
        state.rowsDone[index] = 1
      return
    }

    for (let row = 0; row < state.board.length; row += 1) {
      if (state.board[row]?.[index] === 0)
        return
    }
    state.colsDone[index] = 1
  }

  private markAllDone(state: SolverState): void {
    state.rowsDone.fill(1)
    state.colsDone.fill(1)
  }

  private isSolvedBoard(board: number[][]): boolean {
    for (const row of board) {
      for (const cell of row) {
        if (cell === 0)
          return false
      }
    }
    return true
  }

  private snapshotStep(board: number[][]): number[][] {
    return board.map(row => row.map(cell => (cell === -1 ? 2 : cell)))
  }

  private cloneBoard(board: number[][]): number[][] {
    return board.map(row => [...row])
  }

  private cloneState(state: SolverState): SolverState {
    return {
      board: state.board.map(row => [...row]),
      rowsDone: [...state.rowsDone],
      colsDone: [...state.colsDone],
      rowsPoss: state.rowsPoss.map(line => line.map(poss => [...poss])),
      colsPoss: state.colsPoss.map(line => line.map(poss => [...poss])),
      solveSteps: state.solveSteps.map(step => step.map(row => [...row])),
    }
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

  private applyFinalState(state: SolverState): void {
    this.rowsDone = [...state.rowsDone]
    this.colsDone = [...state.colsDone]
    this.board = this.normalizeBoard(state.board)
    this.solveSteps = state.solveSteps.map(step => step.map(row => [...row]))
  }

  private normalizeBoard(board: number[][]): number[][] {
    return board.map(row => row.map(cell => (cell === 1 ? 1 : 0)))
  }

  private createResult(iterations: number, backtrackNodes: number, timedOut: boolean): SolveResult {
    return {
      board: this.board.map(row => [...row]),
      solveSteps: this.solveSteps.map(step => step.map(row => [...row])),
      solved: this.solved,
      status: this.status,
      iterations,
      backtrackNodes,
      timedOut,
    }
  }
}
