import type { ComponentPublicInstance } from 'vue'
import { CellTypes } from '@picross/shared'
import { nextTick, ref } from 'vue'
import { usePuzzleDomainStore } from '../stores/puzzle-domain'
import { usePuzzleSolverStore } from '../stores/puzzle-solver'
import { usePuzzleUiStore } from '../stores/puzzle-ui'

function getCellStateLabel(cellType: CellTypes) {
  switch (cellType) {
    case CellTypes.Fill:
      return 'filled'
    case CellTypes.Cross:
      return 'crossed'
    case CellTypes.Circle:
      return 'circled'
    default:
      return 'empty'
  }
}

function getToolLabel(cellType: CellTypes) {
  switch (cellType) {
    case CellTypes.Fill:
      return 'fill'
    case CellTypes.Cross:
      return 'cross'
    case CellTypes.Circle:
      return 'circle'
    default:
      return 'clear'
  }
}

export function usePuzzleBoardInteractions() {
  const puzzleDomain = usePuzzleDomainStore()
  const puzzleSolver = usePuzzleSolverStore()
  const puzzleUi = usePuzzleUiStore()
  const cellRefs = ref<HTMLButtonElement[]>([])

  function showSelectedCell(row: number, col: number) {
    return puzzleUi.row === row && puzzleUi.col === col
  }

  function getCell(row: number, col: number): CellTypes {
    return puzzleDomain.getCell(row, col)
  }

  function setCell(row: number, col: number, type: CellTypes) {
    if (puzzleSolver.isBusy)
      return

    puzzleUi.setPointLocation(row, col)
    puzzleDomain.setCell(row, col, type)
  }

  function setCellRef(element: Element | ComponentPublicInstance | null, row: number, col: number) {
    if (!(element instanceof HTMLButtonElement))
      return

    cellRefs.value[(row * puzzleDomain.width) + col] = element
  }

  function focusCell(row: number, col: number) {
    nextTick(() => {
      cellRefs.value[(row * puzzleDomain.width) + col]?.focus()
    })
  }

  function moveFocus(rowDelta: number, colDelta: number) {
    const next = puzzleUi.moveSelection(rowDelta, colDelta)
    focusCell(next.row, next.col)
  }

  function onCellFocus(row: number, col: number) {
    puzzleUi.setPointLocation(row, col)
  }

  function onCellKeydown(event: KeyboardEvent, row: number, col: number) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(-1, 0)
        return
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(1, 0)
        return
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(0, -1)
        return
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(0, 1)
        return
      case 'Home':
        event.preventDefault()
        puzzleUi.setPointLocation(row, 0)
        focusCell(row, 0)
        return
      case 'End':
        event.preventDefault()
        puzzleUi.setPointLocation(row, puzzleDomain.width - 1)
        focusCell(row, puzzleDomain.width - 1)
        return
      case ' ':
      case 'Enter':
        event.preventDefault()
        setCell(row, col, puzzleUi.cellType)
    }
  }

  function getCellLabel(row: number, col: number) {
    const currentState = getCellStateLabel(getCell(row, col))
    return `Row ${row + 1}, column ${col + 1}, ${currentState}. Press Enter or Space to ${getToolLabel(puzzleUi.cellType)} this cell.`
  }

  return {
    cellRefs,
    getCell,
    getCellLabel,
    onCellFocus,
    onCellKeydown,
    setCell,
    setCellRef,
    showSelectedCell,
  }
}
