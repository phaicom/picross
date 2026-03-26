<script setup lang="ts">
import { usePuzzleBoardInteractions } from '../../composables/usePuzzleBoardInteractions'
import { usePuzzleHintCompletion } from '../../composables/usePuzzleHintCompletion'
import { usePuzzleDomainStore } from '../../stores/puzzle-domain'
import { usePuzzleSolverStore } from '../../stores/puzzle-solver'
import { usePuzzleUiStore } from '../../stores/puzzle-ui'
import PuzzleCellType from './CellType.vue'
import PuzzleTemp from './Temp.vue'

const puzzleDomain = usePuzzleDomainStore()
const puzzleSolver = usePuzzleSolverStore()
const puzzleUi = usePuzzleUiStore()
const { colHintCompletion, rowHintCompletion } = usePuzzleHintCompletion()
const {
  getCell,
  getCellLabel,
  onCellFocus,
  onCellKeydown,
  setCell,
  setCellRef,
  showSelectedCell,
} = usePuzzleBoardInteractions()
</script>

<template>
  <section class="flex flex-col h-full min-h-0 min-w-0 w-full" aria-labelledby="puzzle-board-title">
    <h2 id="puzzle-board-title" class="sr-only">
      Puzzle board
    </h2>
    <p id="puzzle-board-instructions" class="sr-only">
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
      <PuzzleTemp v-if="puzzleDomain.isWin">
        YOU WIN!
      </PuzzleTemp>
    </Transition>
    <div class="pb-1 flex h-full max-w-full min-h-0 w-full select-none items-start justify-start overflow-auto">
      <div class="font-normal grid grid-cols-[max-content_max-content] w-max">
        <div class="rounded-bl-lg rounded-tl-lg bg-white flex flex-col min-w-min [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
          <div
            v-for="(row, i) in puzzleDomain.clues.rows" :key="i" class="p-1 flex flex-row gap-2.5 h-14 min-w-15 items-center justify-end odd:border-l-2 odd:border-t-2 odd:border-cell first:rounded-tl-lg last:rounded-bl-lg odd:bg-cell last:odd:border-b-2"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === puzzleUi.row }"
          >
            <div v-for="(item, j) in row" :key="j" :class="{ 'text-[#8e98bf] line-through': rowHintCompletion[i]?.[j] }">
              {{ item }}
            </div>
          </div>
        </div>
        <div class="bg-white flex flex-col [box-shadow:11px_-9px_30px_-12px_#4b69ff1a] relative">
          <div v-for="(_, i) in puzzleDomain.height" :key="i" class="flex flex-row min-w-min items-center justify-end">
            <button
              v-for="(_cell, j) in puzzleDomain.width"
              :key="j"
              :ref="element => setCellRef(element, i, j)"
              type="button"
              class="text-[2.75rem] border-l-2 border-t-2 border-cell bg-white flex h-14 w-14 transition-colors items-center justify-center relative touch-manipulation focus-visible:outline-2 focus-visible:outline-my-blue focus-visible:outline-offset-[-2px] focus-visible:outline last:border-r-2 hover:bg-my-light-violet-10 disabled:cursor-wait focus-visible:z-20 disabled:hover:bg-white"
              :class="{
                'border-b-2': i === puzzleDomain.height - 1,
                'bg-my-light-violet-10': showSelectedCell(i, j),
              }"
              :aria-label="getCellLabel(i, j)"
              aria-describedby="puzzle-board-instructions"
              :disabled="puzzleSolver.isBusy"
              @click="setCell(i, j, puzzleUi.cellType)"
              @focus="onCellFocus(i, j)"
              @keydown="onCellKeydown($event, i, j)"
              @mouseenter="puzzleUi.setPointLocation(i, j)"
            >
              <PuzzleCellType :cell-type="getCell(i, j)" class="pointer-events-none" />
              <span v-if="showSelectedCell(i, j)" class="border-2 border-my-light-violet-20 pointer-events-none inset-[-2px] absolute z-10" />
            </button>
          </div>
        </div>
        <div />
        <div class="rounded-bl-lg rounded-br-lg bg-white flex flex-row min-w-min [box-shadow:0px_5px_24px_0px_#4b69ff1a]">
          <div
            v-for="(col, i) in puzzleDomain.clues.cols" :key="i" class="leading-5 flex flex-col min-h-15 w-14 items-center justify-start odd:border-b-2 odd:border-l-2 odd:border-cell first:rounded-bl-lg last:rounded-br-lg odd:bg-cell last:odd:border-r-2"
            :class="{ 'bg-my-light-violet-20! border-my-light-violet-20!': i === puzzleUi.col }"
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
