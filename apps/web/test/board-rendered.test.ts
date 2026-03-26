import { CellTypes } from '@picross/shared'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Board from '../app/components/Puzzle/Board.vue'
import { mountPuzzleComponent } from './test-utils'

function getCellButton(container: Element, row: number, col: number) {
  return container.querySelector<HTMLButtonElement>(`button[aria-label^="Row ${row + 1}, column ${col + 1},"]`)
}

describe('board.vue', () => {
  it('uses roving tabindex and moves focus with arrow keys', async () => {
    const { puzzleUi, wrapper } = mountPuzzleComponent(Board)
    const firstCell = getCellButton(wrapper.element, 0, 0)

    expect(firstCell).not.toBeNull()
    expect(firstCell?.getAttribute('tabindex')).toBe('0')
    expect(getCellButton(wrapper.element, 0, 1)?.getAttribute('tabindex')).toBe('-1')

    firstCell?.focus()
    firstCell?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
    await nextTick()

    const secondCell = getCellButton(wrapper.element, 0, 1)
    expect(puzzleUi.row).toBe(0)
    expect(puzzleUi.col).toBe(1)
    expect(document.activeElement).toBe(secondCell)
    expect(secondCell?.getAttribute('tabindex')).toBe('0')
    expect(firstCell?.getAttribute('tabindex')).toBe('-1')
  })

  it('moves focus to the current row boundaries with Home and End', async () => {
    const { wrapper } = mountPuzzleComponent(Board)
    const middleCell = getCellButton(wrapper.element, 2, 2)

    middleCell?.focus()
    middleCell?.dispatchEvent(new FocusEvent('focus'))
    middleCell?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }))
    await nextTick()

    expect(document.activeElement).toBe(getCellButton(wrapper.element, 2, 4))

    const rowEndCell = getCellButton(wrapper.element, 2, 4)
    rowEndCell?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Home' }))
    await nextTick()

    expect(document.activeElement).toBe(getCellButton(wrapper.element, 2, 0))
  })

  it('keeps accessible labels in sync with tool choice and cell state', async () => {
    const { puzzleDomain, puzzleUi, wrapper } = mountPuzzleComponent(Board)
    const cell = getCellButton(wrapper.element, 0, 0)

    expect(wrapper.get('#puzzle-board-instructions').text()).toContain('Use arrow keys to move across the board.')

    puzzleUi.setCellType(CellTypes.Cross)
    await nextTick()

    expect(cell?.getAttribute('aria-label')).toContain('empty')
    expect(cell?.getAttribute('aria-label')).toContain('cross this cell')

    cell?.focus()
    cell?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
    await nextTick()

    expect(puzzleDomain.getCell(0, 0)).toBe(CellTypes.Cross)
    expect(getCellButton(wrapper.element, 0, 0)?.getAttribute('aria-label')).toContain('crossed')
  })
})
