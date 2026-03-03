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

function getHintRuns(values: number[]) {
  const runs: number[] = []
  let count = 0

  for (const value of values) {
    if (value === CellTypes.Fill) {
      count += 1
      continue
    }

    if (count > 0) {
      runs.push(count)
      count = 0
    }
  }

  if (count > 0)
    runs.push(count)

  return runs
}

const rowHintCompletion = computed(() => {
  return puzzle.clues.rows.map((rowClues, rowIndex) => {
    const rowValues = puzzle.grid[rowIndex] ?? []
    const runs = getHintRuns(rowValues)
    return rowClues.map((clue, clueIndex) => runs[clueIndex] === clue)
  })
})

const colHintCompletion = computed(() => {
  return puzzle.clues.cols.map((colClues, colIndex) => {
    const colValues = Array.from({ length: puzzle.height }, (_, rowIndex) => puzzle.grid[rowIndex]?.[colIndex] ?? CellTypes.Empty)
    const runs = getHintRuns(colValues)
    return colClues.map((clue, clueIndex) => runs[clueIndex] === clue)
  })
})
</script>

<template>
  <section class="flex flex-col h-full min-h-0 min-w-0 w-full">
    <Transition
      enter-active-class="transition-transform duration-500 ease-out"
      enter-from-class="scale-0"
      enter-to-class="scale-100"
      leave-active-class="transition-transform duration-500 ease-in"
      leave-from-class="scale-100"
      leave-to-class="scale-0"
    >
      <PuzzleTemp v-if="puzzle.isWin">
        YOU WIN!
      </PuzzleTemp>
    </Transition>
    <div class="flex h-full max-w-full min-h-0 w-full select-none items-start justify-start overflow-auto">
      <div class="font-normal grid grid-cols-[max-content_max-content] w-max">
        <div class="rounded-bl-lg rounded-tl-lg bg-white flex flex-col min-w-min [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
          <div
            v-for="(row, i) in puzzle.clues.rows" :key="i" class="p-1 flex flex-row gap-2.5 h-14 min-w-15 items-center justify-end odd:border-l-2 odd:border-t-2 odd:border-cell first:rounded-tl-lg last:rounded-bl-lg odd:bg-cell last:odd:border-b-2"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === pointer.row }"
          >
            <div v-for="(item, j) in row" :key="j" :class="{ 'text-[#8e98bf] line-through': rowHintCompletion[i]?.[j] }">
              {{ item }}
            </div>
          </div>
        </div>
        <div class="bg-white flex flex-col [box-shadow:11px_-9px_30px_-12px_#4b69ff1a] relative">
          <div v-for="(_, i) in puzzle.height" :key="i" class="flex flex-row min-w-min items-center justify-end">
            <div v-for="(_cell, j) in puzzle.width" :key="j" class="border-l-2 border-t-2 border-cell flex h-14 w-14 cursor-pointer items-center justify-center relative last:border-r-2" :class="{ 'border-b-2': i === puzzle.height - 1 }" @click="setCell(i, j, pointer.cellType)" @mouseover="pointer.setPointLocation(i, j)">
              <PuzzleCellType :cell-type="getCell(i, j)" class="text-[2.75rem]" />
              <div v-if="showSelectedCell(i, j)" class="border-2 border-my-light-violet-20 h-[calc(100%+4px)] w-[calc(100%+4px)] absolute z-10 -left-[2px] -top-[2px]" />
            </div>
          </div>
        </div>
        <div />
        <div class="rounded-bl-lg rounded-br-lg bg-white flex flex-row min-w-min [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
          <div
            v-for="(col, i) in puzzle.clues.cols" :key="i" class="leading-5 flex flex-col min-h-15 w-14 items-center justify-start odd:border-b-2 odd:border-l-2 odd:border-cell first:rounded-bl-lg last:rounded-br-lg odd:bg-cell last:odd:border-r-2"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === pointer.col }"
          >
            <div v-for="(item, j) in col" :key="j" :class="{ 'text-[#8e98bf] line-through': colHintCompletion[i]?.[j] }">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
