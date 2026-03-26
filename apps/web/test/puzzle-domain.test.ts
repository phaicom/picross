import { CellTypes } from '@picross/shared'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePuzzleDomainStore } from '../app/stores/puzzle-domain'

describe('puzzle-domain win detection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('marks a completed board as a win without requiring an async solution sync', () => {
    const puzzleDomain = usePuzzleDomainStore()
    puzzleDomain.initialize()

    expect(puzzleDomain.solution).toEqual([])

    puzzleDomain.replaceGrid([
      [CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Empty],
      [CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Empty],
      [CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Fill],
      [CellTypes.Fill, CellTypes.Empty, CellTypes.Fill, CellTypes.Empty, CellTypes.Fill],
      [CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Fill],
    ])

    expect(puzzleDomain.isWin).toBe(true)
  })

  it('treats non-filled marks as empty when validating clues', () => {
    const puzzleDomain = usePuzzleDomainStore()
    puzzleDomain.initialize()

    puzzleDomain.replaceGrid([
      [CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Cross],
      [CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Circle],
      [CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Fill],
      [CellTypes.Fill, CellTypes.Empty, CellTypes.Fill, CellTypes.Empty, CellTypes.Fill],
      [CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Fill],
    ])

    expect(puzzleDomain.isWin).toBe(true)
  })

  it('rejects boards that satisfy rows but break column clues', () => {
    const puzzleDomain = usePuzzleDomainStore()
    puzzleDomain.initialize()

    puzzleDomain.replaceGrid([
      [CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Empty],
      [CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Fill, CellTypes.Empty],
      [CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Empty, CellTypes.Fill],
      [CellTypes.Fill, CellTypes.Fill, CellTypes.Empty, CellTypes.Empty, CellTypes.Fill],
      [CellTypes.Empty, CellTypes.Empty, CellTypes.Fill, CellTypes.Empty, CellTypes.Fill],
    ])

    expect(puzzleDomain.isWin).toBe(false)
  })
})
