<script setup lang="ts">
import { CellTypes } from '@picross/shared'

const puzzleUi = usePuzzleUiStore()
const cellTypes = [CellTypes.Fill, CellTypes.Cross, CellTypes.Circle]

function getCellBorder(cellType: CellTypes) {
  return puzzleUi.cellType === cellType ? 'border-cell-selected' : 'border-cell'
}

function getCellTypeLabel(cellType: CellTypes) {
  switch (cellType) {
    case CellTypes.Fill:
      return 'Fill cells'
    case CellTypes.Cross:
      return 'Mark empty with cross'
    case CellTypes.Circle:
      return 'Mark maybe with circle'
    default:
      return 'Cell tool'
  }
}
</script>

<template>
  <section class="shrink-0" aria-label="Cell tools">
    <div class="p-4 rounded-lg bg-white flex flex-row gap-4 [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
      <button
        v-for="(cellType, i) in cellTypes"
        :key="i"
        type="button"
        class="text-[1.75rem] border-2 flex h-11 w-11 transition-colors items-center justify-center touch-manipulation focus-visible:outline-2 focus-visible:outline-my-blue focus-visible:outline-offset-2 focus-visible:outline"
        :class="getCellBorder(cellType)"
        :aria-label="getCellTypeLabel(cellType)"
        :aria-pressed="puzzleUi.cellType === cellType"
        @click="puzzleUi.setCellType(cellType)"
      >
        <PuzzleCellType :cell-type="cellType" />
      </button>
    </div>
  </section>
</template>
