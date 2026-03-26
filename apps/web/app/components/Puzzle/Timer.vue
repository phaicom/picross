<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { usePuzzleDomainStore } from '../../stores/puzzle-domain'
import { usePuzzleSolverStore } from '../../stores/puzzle-solver'
import { usePuzzleUiStore } from '../../stores/puzzle-ui'

const puzzleDomain = usePuzzleDomainStore()
const puzzleSolver = usePuzzleSolverStore()
const puzzleUi = usePuzzleUiStore()
const presets = [
  { id: 'fast', label: 'Fast' },
  { id: 'normal', label: 'Normal' },
  { id: 'deep', label: 'Deep' },
] as const

const time = ref('00:00:00')
const isHydrated = ref(false)
let interval: ReturnType<typeof setInterval> | null = null

function startTimer() {
  stopTimer()
  time.value = '00:00:00'
  const startTime = Date.now()
  interval = setInterval(() => {
    const elapsedTime = Date.now() - startTime
    const seconds = Math.floor(elapsedTime / 1000) % 60
    const minutes = Math.floor(elapsedTime / 1000 / 60) % 60
    const hours = Math.floor(elapsedTime / 1000 / 60 / 60)
    time.value = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }, 1000)
}

function stopTimer() {
  clearInterval(interval as ReturnType<typeof setInterval>)
  interval = null
}

function pad(num: number) {
  return (num < 10 ? '0' : '') + num
}

function resetBoard() {
  puzzleSolver.resetSolverState()
  puzzleUi.resetSelection()
  stopTimer()
  startTimer()
  puzzleDomain.resetBoard()
}

async function startSolver() {
  stopTimer()
  time.value = '00:00:00'
  await puzzleSolver.startSolver()
}

function selectPuzzle(event: Event) {
  const index = Number((event.target as HTMLSelectElement).value)
  puzzleSolver.resetSolverState()
  puzzleDomain.selectPuzzle(index)
  puzzleUi.resetSelection()
  stopTimer()
  startTimer()
}

onMounted(() => {
  startTimer()
  isHydrated.value = true
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <section class="p-[10px] rounded-xl bg-[url('/timer-bg.svg')] bg-my-light-violet-10 w-full select-none shadow-[0_4px_14px_0_#4b69ff17] bg-cover bg-bottom bg-no-repeat">
    <div class="mb-2 flex flex-wrap gap-2 items-start">
      <div>
        <p class="text-[10px] text-my-gray tracking-[0.08em] uppercase">
          {{ puzzleDomain.catalogue || 'Picross puzzle' }}
        </p>
        <h1 class="text-[16px] text-my-dark-violet-70 leading-tight font-bold">
          {{ puzzleDomain.title || 'Untitled puzzle' }}
        </h1>
      </div>
      <p v-if="puzzleDomain.author" class="text-[11px] text-my-gray leading-tight font-medium ml-auto text-right">
        By {{ puzzleDomain.author }}
      </p>
    </div>

    <div class="flex flex-wrap gap-2 items-center">
      <div class="text-[16px] text-my-dark-violet-70 leading-[30px] tracking-[0.02em] font-bold px-[10px] border border-my-light-violet-20 rounded-lg bg-white h-8 min-w-[100px] tabular-nums">
        {{ time }}
      </div>
      <div class="ml-auto flex gap-1.5 items-center">
        <button class="text-[11px] text-white leading-none tracking-[0.06em] font-bold px-[10px] rounded-lg bg-my-blue h-8 min-w-[88px] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-my-blue focus-visible:outline-offset-2 focus-visible:outline active:bg-my-blue-120 hover:bg-my-blue-60 disabled:opacity-60 disabled:cursor-not-allowed" :disabled="puzzleSolver.isBusy" @click="startSolver()">
          <span v-if="puzzleSolver.isBusy" class="inline-flex gap-1.5 items-center">
            <span class="border-2 border-white/35 border-t-white rounded-full h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            <span>Solving</span>
          </span>
          <span v-else>Solve</span>
        </button>
        <button class="text-[11px] text-white leading-none tracking-[0.06em] font-bold px-[10px] rounded-lg bg-my-red h-8 min-w-[62px] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-my-red focus-visible:outline-offset-2 focus-visible:outline active:bg-my-red-120 hover:bg-my-red-60" @click="resetBoard()">
          Reset
        </button>
      </div>
    </div>

    <div class="mt-2 gap-1.5 grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <select
        class="text-[11px] text-my-dark-violet-70 leading-none font-semibold px-2 border border-my-light-violet-20 rounded-lg bg-white h-[30px] min-w-0 w-full focus-visible:outline-2 focus-visible:outline-my-blue focus-visible:outline-offset-2 focus-visible:outline"
        :disabled="puzzleSolver.isBusy"
        :value="puzzleDomain.currentPuzzleIndex"
        aria-label="Select puzzle"
        @change="selectPuzzle($event)"
      >
        <option v-for="item in puzzleDomain.puzzleChoices" :key="item.index" :value="item.index">
          {{ item.label }}
        </option>
      </select>

      <div class="p-[2px] border border-my-light-violet-20 rounded-lg bg-white flex gap-1 items-center" role="group" aria-label="Solver depth">
        <button
          v-for="preset in presets"
          :key="preset.id"
          class="text-[10px] text-my-dark-violet-70 tracking-[0.04em] font-bold px-2 rounded-md bg-transparent h-6 min-w-12 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-my-blue focus-visible:outline-offset-2 focus-visible:outline disabled:opacity-60 disabled:cursor-not-allowed"
          :class="{ 'bg-my-blue text-white': puzzleSolver.solverPreset === preset.id }"
          :disabled="puzzleSolver.isBusy"
          :aria-pressed="puzzleSolver.solverPreset === preset.id"
          @click="puzzleSolver.setSolverPreset(preset.id)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <p class="text-[10px] text-my-gray leading-none font-semibold mt-2" aria-live="polite">
      <span v-if="puzzleSolver.solverStatus === 'solved' && puzzleDomain.isWin">Solved board loaded.</span>
      <span v-else-if="puzzleSolver.isBusy">Solving in progress.</span>
      <span v-else-if="puzzleSolver.solverStatus === 'invalid'">This puzzle data appears invalid.</span>
    </p>
    <p v-if="isHydrated && puzzleSolver.solverTimedOut" class="text-[10px] text-my-red leading-none font-semibold mt-1" aria-live="polite">
      Timed out on this preset
    </p>
  </section>
</template>
