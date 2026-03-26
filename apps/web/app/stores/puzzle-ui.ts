import { CellTypes } from '@picross/shared'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePuzzleDomainStore } from './puzzle-domain'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export const usePuzzleUiStore = defineStore('puzzle-ui', () => {
  const domain = usePuzzleDomainStore()
  const row = ref(0)
  const col = ref(0)
  const cellType = ref<CellTypes>(CellTypes.Fill)

  function setCellType(nextType: CellTypes) {
    cellType.value = nextType
  }

  function setPointLocation(nextRow: number, nextCol: number) {
    const maxRow = Math.max(domain.height - 1, 0)
    const maxCol = Math.max(domain.width - 1, 0)
    row.value = clamp(nextRow, 0, maxRow)
    col.value = clamp(nextCol, 0, maxCol)
    return { row: row.value, col: col.value }
  }

  function moveSelection(rowDelta: number, colDelta: number) {
    return setPointLocation(row.value + rowDelta, col.value + colDelta)
  }

  function resetSelection() {
    setPointLocation(0, 0)
  }

  watch(() => [domain.height, domain.width], () => {
    setPointLocation(row.value, col.value)
  }, { immediate: true })

  return {
    cellType,
    col,
    moveSelection,
    resetSelection,
    row,
    setCellType,
    setPointLocation,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePuzzleUiStore, import.meta.hot))
