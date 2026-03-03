<script setup lang="ts">
import { CellTypes } from '@picross/shared'

const pointer = usePointerStore()
const cellTypes = [CellTypes.Fill, CellTypes.Cross, CellTypes.Circle]

function getCellBorder(cellType: CellTypes) {
  return pointer.cellType === cellType ? 'border-cell-selected' : 'border-cell'
}
</script>

<template>
  <section class="shrink-0">
    <div class="p-4 rounded-lg bg-white flex flex-row gap-4 [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
      <div v-for="(cellType, i) in cellTypes" :key="i" class="text-[1.75rem] border-2 flex h-10 w-10 cursor-pointer items-center justify-center" :class="getCellBorder(cellType)" @click="pointer.setCellType(cellType)">
        <PuzzleCellType :cell-type="cellType" />
      </div>
    </div>
  </section>
</template>
