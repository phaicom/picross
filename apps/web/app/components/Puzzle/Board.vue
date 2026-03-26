<script setup lang="ts">
import { usePuzzleBoard } from '../../composables/usePuzzleBoard'
import PuzzleCellType from './CellType.vue'
import PuzzleTemp from './Temp.vue'

const {
  boardInstructionsId,
  boardTitleId,
  clues,
  colHintCompletion,
  colIndices,
  currentCol,
  currentRow,
  getCell,
  getCellLabel,
  getCellTabIndex,
  height,
  isBusy,
  isWin,
  onCellFocus,
  onCellKeydown,
  rowHintCompletion,
  rowIndices,
  setCell,
  setCellRef,
  showSelectedCell,
} = usePuzzleBoard()
</script>

<template>
  <section class="flex flex-col h-full min-h-0 min-w-0 w-full" :aria-labelledby="boardTitleId">
    <h2 :id="boardTitleId" class="sr-only">
      Puzzle board
    </h2>
    <p :id="boardInstructionsId" class="sr-only">
      Use arrow keys to move across the board. Press Enter or Space to apply the selected tool to the focused cell.
    </p>
    <Transition
      enter-active-class="transition-transform duration-500 ease-out"
      enter-from-class="scale-0"
      enter-to-class="scale-100"
      leave-active-class="transition-transform duration-500 ease-in"
      leave-from-class="scale-100"
      leave-to-class="scale-0"
    >
      <PuzzleTemp v-if="isWin">
        YOU WIN!
      </PuzzleTemp>
    </Transition>
    <div class="pb-1 flex h-full max-w-full min-h-0 w-full select-none items-start justify-start overflow-auto">
      <div class="font-normal grid grid-cols-[max-content_max-content] w-max">
        <div class="rounded-bl-lg rounded-tl-lg bg-white flex flex-col min-w-min [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
          <div
            v-for="(row, i) in clues.rows" :key="i" class="p-1 flex flex-row gap-2.5 h-14 min-w-15 items-center justify-end odd:border-l-2 odd:border-t-2 odd:border-cell first:rounded-tl-lg last:rounded-bl-lg odd:bg-cell last:odd:border-b-2"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === currentRow }"
          >
            <div v-for="(item, j) in row" :key="j" :class="{ 'text-[#8e98bf] line-through': rowHintCompletion[i]?.[j] }">
              {{ item }}
            </div>
          </div>
        </div>
        <div class="bg-white flex flex-col [box-shadow:11px_-9px_30px_-12px_#4b69ff1a] relative" role="grid" :aria-describedby="boardInstructionsId" aria-label="Puzzle grid">
          <div v-for="i in rowIndices" :key="i" class="flex flex-row min-w-min items-center justify-end" role="row">
            <button
              v-for="j in colIndices"
              :key="j"
              :ref="element => setCellRef(element, i, j)"
              type="button"
              class="text-[2.75rem] border-l-2 border-t-2 border-cell bg-white flex h-14 w-14 transition-colors items-center justify-center relative touch-manipulation focus-visible:outline-2 focus-visible:outline-my-blue focus-visible:outline-offset-[-2px] focus-visible:outline last:border-r-2 hover:bg-my-light-violet-10 disabled:cursor-wait focus-visible:z-20 disabled:hover:bg-white"
              :class="{
                'border-b-2': i === height - 1,
                'bg-my-light-violet-10': showSelectedCell(i, j),
              }"
              :aria-label="getCellLabel(i, j)"
              :aria-describedby="boardInstructionsId"
              :disabled="isBusy"
              :tabindex="getCellTabIndex(i, j)"
              @click="setCell(i, j)"
              @focus="onCellFocus(i, j)"
              @keydown="onCellKeydown($event, i, j)"
              @mouseenter="onCellFocus(i, j)"
            >
              <PuzzleCellType :cell-type="getCell(i, j)" class="pointer-events-none" />
              <span v-if="showSelectedCell(i, j)" class="border-2 border-my-light-violet-20 pointer-events-none inset-[-2px] absolute z-10" />
            </button>
          </div>
        </div>
        <div />
        <div class="rounded-bl-lg rounded-br-lg bg-white flex flex-row min-w-min [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
          <div
            v-for="(col, i) in clues.cols" :key="i" class="leading-5 flex flex-col min-h-15 w-14 items-center justify-start odd:border-b-2 odd:border-l-2 odd:border-cell first:rounded-bl-lg last:rounded-br-lg odd:bg-cell last:odd:border-r-2"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === currentCol }"
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
