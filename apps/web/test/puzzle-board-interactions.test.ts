// @vitest-environment happy-dom

import { CellTypes } from '@picross/shared'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { usePuzzleBoardInteractions } from '../app/composables/usePuzzleBoardInteractions'
import { usePuzzleDomainStore } from '../app/stores/puzzle-domain'
import { usePuzzleUiStore } from '../app/stores/puzzle-ui'

describe('usePuzzleBoardInteractions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const puzzleDomain = usePuzzleDomainStore()
    puzzleDomain.initialize()
  })

  it('moves focus and selection with keyboard navigation', async () => {
    const puzzleUi = usePuzzleUiStore()
    const interactions = usePuzzleBoardInteractions()

    const buttons = Array.from({ length: 25 }).fill(document.createElement('button'))
    const container = document.createElement('div')
    buttons.forEach(button => container.appendChild(button))
    document.body.appendChild(container)
    buttons.forEach((button, index) => {
      const row = Math.floor(index / 5)
      const col = index % 5
      interactions.setCellRef(button, row, col)
    })

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    interactions.onCellKeydown(event, 0, 0)
    await nextTick()

    expect(puzzleUi.row).toBe(0)
    expect(puzzleUi.col).toBe(1)
    expect(document.activeElement).toBe(buttons[1])
    container.remove()
  })

  it('applies the selected tool on Enter and keeps accessible labels in sync', () => {
    const puzzleDomain = usePuzzleDomainStore()
    const puzzleUi = usePuzzleUiStore()
    const interactions = usePuzzleBoardInteractions()

    puzzleUi.setCellType(CellTypes.Cross)
    interactions.onCellKeydown(new KeyboardEvent('keydown', { key: 'Enter' }), 0, 0)

    expect(puzzleDomain.getCell(0, 0)).toBe(CellTypes.Cross)
    expect(interactions.getCellLabel(0, 0)).toContain('crossed')
    expect(interactions.getCellLabel(0, 0)).toContain('cross this cell')
  })

  it('moves to row boundaries for Home and End', async () => {
    const puzzleUi = usePuzzleUiStore()
    const interactions = usePuzzleBoardInteractions()

    const buttons = Array.from({ length: 25 }).fill(document.createElement('button'))
    const container = document.createElement('div')
    buttons.forEach(button => container.appendChild(button))
    document.body.appendChild(container)
    buttons.forEach((button, index) => {
      const row = Math.floor(index / 5)
      const col = index % 5
      interactions.setCellRef(button, row, col)
    })

    puzzleUi.setPointLocation(2, 2)
    interactions.onCellKeydown(new KeyboardEvent('keydown', { key: 'End' }), 2, 2)
    await nextTick()

    expect(puzzleUi.col).toBe(4)
    expect(document.activeElement).toBe(buttons[14])

    interactions.onCellKeydown(new KeyboardEvent('keydown', { key: 'Home' }), 2, 4)
    await nextTick()

    expect(puzzleUi.col).toBe(0)
    expect(document.activeElement).toBe(buttons[10])
    container.remove()
  })
})
