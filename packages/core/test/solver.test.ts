import { describe, expect, it } from 'vitest'
import { SimpleSolver } from '../src/solver'

describe('simple solver', () => {
  it('solve 5x5', () => {
    const rows = [[4], [4], [1], [1, 1, 1], [1]]
    const cols = [[2, 1], [2], [2, 1], [2], [3]]
    const solver = new SimpleSolver({ rows, cols })
    const output = [
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 1],
    ]
    expect(solver.solved).toBe(true)
    expect(solver.board).toStrictEqual(output)
  })

  it('uses bounded backtracking when propagation stalls', () => {
    const clues = {
      rows: [[1, 2, 1], [1, 3], [1, 1], [1], [1], [1], [2, 1]],
      cols: [[], [2, 1], [1, 1], [1, 1], [2], [1, 1], [4, 1]],
    }

    const propagationOnly = new SimpleSolver(clues, { autoSolve: false })
    const propagationResult = propagationOnly.solve({ backtracking: false, maxIterations: 2000 })
    expect(propagationResult.status).toBe('stalled')

    const boundedSearch = new SimpleSolver(clues, { autoSolve: false })
    const boundedResult = boundedSearch.solve({
      backtracking: true,
      maxIterations: 4000,
      maxBacktrackNodes: 0,
      timeoutMs: 2000,
    })
    expect(boundedResult.status).toBe('stalled')
    expect(boundedResult.backtrackNodes).toBe(0)

    const fullSearch = new SimpleSolver(clues, { autoSolve: false })
    const solvedResult = fullSearch.solve({
      backtracking: true,
      maxIterations: 4000,
      maxBacktrackNodes: 20000,
      timeoutMs: 2000,
    })

    expect(solvedResult.status).toBe('solved')
    expect(solvedResult.backtrackNodes).toBeGreaterThan(0)
    expect(solvedResult.timedOut).toBe(false)
    expect(matchesClues(solvedResult.board, clues.rows, clues.cols)).toBe(true)
  })
})

function matchesClues(board: number[][], rowClues: number[][], colClues: number[][]): boolean {
  const rowRuns = board.map(row => toRuns(row))
  const colRuns = Array.from({ length: board[0]?.length ?? 0 }, (_, col) => toRuns(board.map(row => row[col] ?? 0)))
  return JSON.stringify(rowRuns) === JSON.stringify(rowClues) && JSON.stringify(colRuns) === JSON.stringify(colClues)
}

function toRuns(cells: number[]): number[] {
  const runs: number[] = []
  let current = 0

  for (const cell of cells) {
    if (cell === 1) {
      current += 1
      continue
    }

    if (current > 0) {
      runs.push(current)
      current = 0
    }
  }

  if (current > 0)
    runs.push(current)

  return runs
}
