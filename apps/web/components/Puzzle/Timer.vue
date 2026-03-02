<script setup lang="ts">
const puzzle = usePuzzleStore()

const time = ref('00:00:00')
let interval: NodeJS.Timeout | null = null

function startTimer() {
  time.value = '00:00:00'
  const startTime = new Date().getTime()
  interval = setInterval(() => {
    const currentTime = new Date().getTime()
    const elapedTime = currentTime - startTime
    const seconds = Math.floor(elapedTime / 1000) % 60
    const minutes = Math.floor(elapedTime / 1000 / 60) % 60
    const hours = Math.floor(elapedTime / 1000 / 60 / 60)
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
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <section bg="my-light-violet-10 cover bottom 2xl:center no-repeat [url(/timer-bg.svg)]" p-4 rounded-lg h-62px w-full select-none>
    <div flex="~ items-center">
      <span text-24px font-600>{{ time }}</span>
      <div ml-auto flex="~ row gap-2">
        <button btn="~ my-blue" uppercase :disabled="puzzle.isStartSolver" @click="startSolver()">
          <div v-if="puzzle.isStartSolver" i-ph-spinner-bold text-lg animate-spin />
          <span v-else>solve</span>
        </button>
        <button btn="~ my-red" uppercase @click="resetBoard()">
          reset
        </button>
      </div>
    </div>
  </section>
</template>
