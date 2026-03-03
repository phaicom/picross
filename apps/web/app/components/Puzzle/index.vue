<template>
  <div class="h-full min-h-0 min-w-0 w-full relative overflow-hidden">
    <PuzzleBG />
    <div
      class="px-6 py-3 gap-3 grid grid-rows-[max-content_minmax(0,1fr)_max-content] h-full min-h-0 min-w-0 w-full relative overflow-hidden"
    >
      <PuzzleTimer />
      <PuzzleBoard />
      <section class="flex flex-row gap-3 w-full items-end justify-center">
        <PuzzlePickCellType />
        <PuzzlePreview />
      </section>
    </div>
  </div>
</template>
