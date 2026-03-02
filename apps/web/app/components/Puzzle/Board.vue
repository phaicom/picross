<script setup lang="ts">
import { CellTypes } from '@picross/shared'

const pointer = usePointerStore()
const puzzle = usePuzzleStore()
puzzle.initialize()

function showSelectedCell(row: number, col: number) {
  return pointer.row === row && pointer.col === col
}

function setCell(row: number, col: number, type: CellTypes) {
  const gridRow = puzzle.grid[row]
  if (!gridRow)
    return

  const current = gridRow[col] ?? CellTypes.Empty
  gridRow[col] = current === type ? CellTypes.Empty : type
}

function getCell(row: number, col: number): CellTypes {
  const gridRow = puzzle.grid[row]
  if (!gridRow)
    return CellTypes.Empty

  return gridRow[col] ?? CellTypes.Empty
}
</script>

<template>
  <section h-full min-h-0 min-w-0 w-full flex="~ col">
    <Transition name="bounce">
      <PuzzleTemp v-if="puzzle.isWin">
        YOU WIN!
      </PuzzleTemp>
    </Transition>
    <!-- board wrapper -->
    <div flex="~ justify-center" h-full max-w-full min-h-0 w-full select-none items-start overflow-auto>
      <div grid="~ cols-[max-content_max-content]" w-max font="400">
        <!-- hints rows -->
        <div flex="~ col" bg-white min-w-min rounded="tl-lg bl-lg" class="box-shadow-board">
          <div
            v-for="(row, i) in puzzle.clues.rows" :key="i" flex="~ row justify-end items-center gap-2.5" p-1 h-14 min-w-15 border="odd:l-2 odd:t-2 last:odd:b-2 cell" bg="odd:cell" rounded="first:tl-lg last:bl-lg"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === pointer.row }"
          >
            <div v-for="(item, j) in row" :key="j">
              {{ item }}
            </div>
          </div>
        </div>
        <!-- cell board -->
        <div flex="~ col" bg-white relative class="box-shadow-board-main">
          <!-- row -->
          <div v-for="(_, i) in puzzle.height" :key="i" flex="~ row justify-end items-center" min-w-min>
            <div v-for="(_cell, j) in puzzle.width" :key="j" border="l-2 t-2 last:r-2 cell" flex="~ justify-center items-center" h-14 w-14 cursor-pointer relative :class="{ 'border-b-2': i === puzzle.height - 1 }" @click="setCell(i, j, pointer.cellType)" @mouseover="pointer.setPointLocation(i, j)">
              <PuzzleCellType :cell-type="getCell(i, j)" text-11 />
              <div v-if="showSelectedCell(i, j)" border="2 my-light-violet-20" absolute class="h-[calc(100%+4px)] w-[calc(100%+4px)] -left-2px -top-2px" z-10 />
            </div>
          </div>
        </div>
        <!-- spacer to keep bottom hints aligned with board columns -->
        <div />
        <!-- hints cols -->
        <div flex="~ row" bg-white min-w-min rounded="bl-lg br-lg" class="box-shadow-board">
          <div
            v-for="(col, i) in puzzle.clues.cols" :key="i" flex="~ col justify-start items-center" leading-5 min-h-15 w-14 border="odd:l-2 odd:b-2 last:odd:r-2 cell" bg="odd:cell" rounded="first:bl-lg last:br-lg"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === pointer.col }"
          >
            <div v-for="(item, j) in col" :key="j">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.box-shadow-board {
  box-shadow: 0px 5px 24px 0px #4b69ff1a;
}

.box-shadow-board-main {
  box-shadow: 11px -9px 30px -12px #4b69ff1a;
}
</style>
