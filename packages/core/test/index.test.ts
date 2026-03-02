import type { Puzzle } from '@picross/shared'
import { sample } from '@picross/shared'
import { describe, expect, it } from 'vitest'
import { Game } from '../src'

describe('game core', () => {
  it('solve 5x5', () => {
    const game = new Game()
    game.setPuzzle(sample[0] as Puzzle)

    const expectClues = {
      rows: [[4], [4], [1], [1, 1, 1], [1]],
      cols: [[2, 1], [2], [2, 1], [2], [3]],
    }
    const expectSolution = [
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 1],
    ]
    const puzzle = game.puzzle
    expect(puzzle.catalogue).toBe('picross #001')
    expect(puzzle.title).toBe('')
    expect(puzzle.author).toBe('Unknown')
    expect(puzzle.copyright).toBe('')
    expect(puzzle.width).toBe(5)
    expect(puzzle.height).toBe(5)
    expect(puzzle.clues).toStrictEqual(expectClues)
    expect(game.solution).toStrictEqual(expectSolution)
  })
})
