import { CellTypes } from '@picross/shared'

export const usePointerStore = defineStore('pointer', () => {
  const row = ref(0)
  const col = ref(0)
  const cellType = ref<CellTypes>(CellTypes.Fill)

  function setCellType(ct: CellTypes) {
    cellType.value = ct
  }

  function setPointLocation(r: number, c: number) {
    row.value = r
    col.value = c
  }

  return { row, col, cellType, setCellType, setPointLocation }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePointerStore, import.meta.hot))
