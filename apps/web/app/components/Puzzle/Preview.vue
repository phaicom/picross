<script setup lang="ts">
import { CellTypes } from '@picross/shared'

const pointer = usePointerStore()
const puzzle = usePuzzleStore()

const previewCells = computed(() => {
  const rows = puzzle.height
  const cols = puzzle.width
  const total = rows * cols

  return Array.from({ length: total }, (_, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    return {
      row,
      col,
      cellType: puzzle.grid[row]?.[col] ?? CellTypes.Empty,
    }
  })
})

const previewGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(puzzle.width, 1)}, minmax(0, 1fr))`,
}))

function getPreviewCellClass(cellType: CellTypes) {
  if (cellType === CellTypes.Fill)
    return 'bg-my-dark-violet-70'

  if (cellType === CellTypes.Cross)
    return 'bg-my-red/65'

  if (cellType === CellTypes.Circle)
    return 'bg-my-sky-blue/75'

  return 'bg-white'
}

function showSelectedCell(row: number, col: number) {
  return pointer.row === row && pointer.col === col
}
</script>

<template>
  <section p-2 rounded-lg bg-white shrink-0 w-34 class="[box-shadow:0px_5px_24px_0px_#4b69ff1a]">
    <div text="[10px] my-gray" leading-none mb-1.5 uppercase tracking="[0.08em]">
      Preview
    </div>
    <div p-1 border border-cell rounded-md class="bg-my-light-violet-10/30">
      <div gap-px grid :style="previewGridStyle">
        <div
          v-for="(cell, index) in previewCells"
          :key="index"
          class="min-w-0 aspect-square"
          :class="[getPreviewCellClass(cell.cellType), showSelectedCell(cell.row, cell.col) ? 'outline outline-1 outline-my-blue outline-offset-0' : '']"
        />
      </div>
    </div>
  </section>
</template>
