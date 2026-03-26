<script setup lang="ts">
const puzzleDomain = usePuzzleDomainStore()

puzzleDomain.initialize()
</script>

<template>
  <div class="p-0 bg-my-light-gray flex items-center justify-center min-h-dvh sm:p-4">
    <main class="bg-white grid grid-rows-[max-content_1fr] max-w-[440px] w-full shadow-none min-h-dvh sm:rounded-[28px] sm:min-h-[min(860px,calc(100dvh-2rem))] sm:shadow-[0_18px_60px_-24px_rgba(46,66,140,0.32)]">
      <TheNav />
      <Puzzle />
    </main>
  </div>
</template>
