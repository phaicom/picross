<script setup lang="ts">
const puzzle = usePuzzleStore()
const presets = [
  { id: 'fast', label: 'Fast' },
  { id: 'normal', label: 'Normal' },
  { id: 'deep', label: 'Deep' },
] as const

const time = ref('00:00:00')
const isHydrated = ref(false)
let interval: NodeJS.Timeout | null = null

function startTimer() {
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
  clearInterval(interval as NodeJS.Timeout)
  interval = null
}

function pad(num: number) {
  return (num < 10 ? '0' : '') + num
}

function resetBoard() {
  puzzle.stopSolver()
  stopTimer()
  startTimer()
  puzzle.resetBoard()
}

function startSolver() {
  puzzle.startSolver()
  stopTimer()
  time.value = '00:00:00'
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
  <section p="[10px]" rounded-xl bg="my-light-violet-10 [url('/timer-bg.svg')] cover bottom no-repeat" w-full select-none shadow="[0_4px_14px_0_#4b69ff17]">
    <div flex="~ items-center" gap-2>
      <div text="[16px] my-dark-violet-70" leading="[30px]" tracking="[0.02em]" font-700 px="[10px]" border="~ my-light-violet-20" rounded-lg bg-white h-8 min-w="[100px]" tabular-nums>
        {{ time }}
      </div>
      <div ml-auto flex="~ items-center" gap-1.5>
        <button text="[11px] white" leading-none tracking="[0.06em]" font-700 px="[10px]" rounded-lg bg="my-blue hover:my-blue-60 active:my-blue-120" h-8 min-w="[62px]" uppercase transition-colors class="disabled:opacity-60 disabled:cursor-not-allowed" :disabled="puzzle.isStartSolver" @click="startSolver()">
          <span v-if="puzzle.isStartSolver" i-ph-spinner-bold text-base animate-spin />
          <span v-else>Solve</span>
        </button>
        <button text="[11px] white" leading-none tracking="[0.06em]" font-700 px="[10px]" rounded-lg bg="my-red hover:my-red-60 active:my-red-120" h-8 min-w="[62px]" uppercase transition-colors @click="resetBoard()">
          Reset
        </button>
      </div>
    </div>

    <div mt-2 grid="~ cols-[minmax(0,1fr)_auto] items-center" gap-1.5>
      <select
        text="[11px] my-dark-violet-70" leading-none font-600 px-2 border="~ my-light-violet-20" rounded-lg bg-white h="[30px]" min-w-0 w-full
        :disabled="puzzle.isStartSolver"
        :value="puzzle.currentPuzzleIndex"
        @change="puzzle.selectPuzzle(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="item in puzzle.puzzleChoices" :key="item.index" :value="item.index">
          {{ item.label }}
        </option>
      </select>

      <div p="[2px]" border="~ my-light-violet-20" rounded-lg bg-white flex="~ items-center" gap-1>
        <button
          v-for="preset in presets"
          :key="preset.id"
          text="[10px] my-dark-violet-70" tracking="[0.04em]" font-700 px-2 rounded-md bg-transparent h-6 min-w-12 uppercase transition-colors class="disabled:opacity-60 disabled:cursor-not-allowed"
          :class="{ 'bg-my-blue text-white': puzzle.solverPreset === preset.id }"
          :disabled="puzzle.isStartSolver"
          @click="puzzle.setSolverPreset(preset.id)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <p v-if="isHydrated && puzzle.solverTimedOut" text="[10px] my-red" leading-none font-600 mt-1>
      Timed out on this preset
    </p>
  </section>
</template>
