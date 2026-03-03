<script setup lang="ts">
import { CellTypes } from '@picross/shared'

const pointer = usePointerStore()
const cellTypes = [CellTypes.Fill, CellTypes.Cross, CellTypes.Circle]

function getCellBorder(cellType: CellTypes) {
  return pointer.cellType === cellType ? 'border-cell-selected' : 'border-cell'
}
</script>

<template>
  <section shrink-0>
    <div p-4 rounded-lg bg-white flex="~ row gap-4" class="[box-shadow:0px_5px_24px_0px_#4b69ff1a]">
      <div v-for="(cellType, i) in cellTypes" :key="i" text-7 border-2px h-10 w-10 cursor-pointer flex="~ items-center justify-center" :class="getCellBorder(cellType)" @click="pointer.setCellType(cellType)">
        <PuzzleCellType :cell-type="cellType" />
      </div>
    </div>
  </section>
</template>
