import type { SolveOptions } from '@picross/core'
import type { Puzzle } from '@picross/shared'
import { CellTypes } from '@picross/shared'

export type SolverPreset = 'fast' | 'normal' | 'deep'
type Difficulty = NonNullable<Puzzle['difficulty']>

export function cloneGrid(grid: number[][]): number[][] {
  return grid.map(row => [...row])
}

export function clonePuzzleClues(puzzle: Puzzle): Puzzle['clues'] {
  return {
    rows: puzzle.clues.rows.map(row => [...row]),
    cols: puzzle.clues.cols.map(col => [...col]),
  }
}

export function createEmptyGrid(height: number, width: number): number[][] {
  return Array.from({ length: height }).map(() => Array.from({ length: width }).map(() => CellTypes.Empty))
}

export function normalizeSolvedGrid(grid: number[][]): number[][] {
  return grid.map(row => row.map(cell => (cell === CellTypes.Fill ? CellTypes.Fill : CellTypes.Empty)))
}

export function getFilledRuns(values: readonly number[]): number[] {
  const runs: number[] = []
  let count = 0

  for (const value of values) {
    if (value === CellTypes.Fill) {
      count += 1
      continue
    }

    if (count > 0) {
      runs.push(count)
      count = 0
    }
  }

  if (count > 0)
    runs.push(count)

  return runs
}

export function doesLineMatchClues(values: readonly number[], clues: readonly number[]): boolean {
  const runs = getFilledRuns(values)

  if (runs.length !== clues.length)
    return false

  return runs.every((run, index) => run === clues[index])
}

export function isBoardSolved(grid: readonly number[][], clues: Puzzle['clues']): boolean {
  if (!grid.length)
    return false

  if (grid.length !== clues.rows.length)
    return false

  const width = clues.cols.length
  if (!grid.every(row => row.length === width))
    return false

  const rowsSolved = clues.rows.every((rowClues, rowIndex) => {
    return doesLineMatchClues(grid[rowIndex] ?? [], rowClues)
  })

  if (!rowsSolved)
    return false

  return clues.cols.every((colClues, colIndex) => {
    const values = Array.from({ length: grid.length }, (_, rowIndex) => grid[rowIndex]?.[colIndex] ?? CellTypes.Empty)
    return doesLineMatchClues(values, colClues)
  })
}

export function formatDifficulty(difficulty?: Puzzle['difficulty']): string {
  const level: Difficulty = difficulty ?? 'medium'
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export function getPresetOptions(preset: SolverPreset, width: number, height: number): SolveOptions {
  const area = Math.max(width * height, 1)

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
