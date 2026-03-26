import type { Puzzle } from '@picross/shared'
import { sample } from '@picross/shared'
import { describe, expect, it } from 'vitest'
import { Game } from '../src'

describe('game core', () => {
  it('loads a puzzle without solving it synchronously', () => {
    const game = new Game()
    game.setPuzzle(sample[0] as Puzzle)

    const expectClues = {
      rows: [[4], [4], [1], [1, 1, 1], [1]],
      cols: [[2, 1], [2], [2, 1], [2], [3]],
    }
    const puzzle = game.puzzle
    expect(puzzle.catalogue).toBe('picross #001')
    expect(puzzle.title).toBe('Starter Cross')
    expect(puzzle.author).toBe('Picross Team')
    expect(puzzle.copyright).toBe('MIT')
    expect(puzzle.width).toBe(5)
    expect(puzzle.height).toBe(5)
    expect(puzzle.clues).toStrictEqual(expectClues)
    expect(game.grid).toStrictEqual([
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ])
    expect(game.solution).toStrictEqual([])
    expect(game.solveSteps).toStrictEqual([])
    expect(game.solverStatus).toBe('stalled')
  })
})
