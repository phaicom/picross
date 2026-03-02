<script setup lang="ts">
import { CellTypes } from '@picross/shared'

const pointer = usePointerStore()
const cellTypes = [CellTypes.Fill, CellTypes.Cross, CellTypes.Circle]

function getCellBorder(cellType: CellTypes) {
  return pointer.cellType === cellType ? 'border-cell-selected' : 'border-cell'
}
</script>

<template>
  <section w-full flex="~ justify-center">
    <div p-4 rounded-lg bg-white flex="~ row gap-4" class="shadow-cell-type">
      <div v-for="(cellType, i) in cellTypes" :key="i" text-7 border-2px h-10 w-10 cursor-pointer flex="~ items-center justify-center" :class="getCellBorder(cellType)" @click="pointer.setCellType(cellType)">
        <PuzzleCellType :cell-type="cellType" />
      </div>
    </div>
  </section>
</template>

<style>
.shadow-cell-type {
  box-shadow: 0px 5px 24px 0px #4b69ff1a;
}
</style>
