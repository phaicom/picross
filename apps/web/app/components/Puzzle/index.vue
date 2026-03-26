<template>
  <div class="h-full min-h-0 min-w-0 w-full relative">
    <PuzzleBG />
    <div
      class="px-4 py-3 gap-3 grid grid-rows-[max-content_minmax(0,1fr)_max-content] h-full min-h-0 min-w-0 w-full relative sm:px-6"
    >
      <PuzzleTimer />
      <PuzzleBoard />
      <section class="flex flex-wrap gap-3 w-full items-end justify-center">
        <PuzzlePickCellType />
        <PuzzlePreview />
      </section>
    </div>
  </div>
</template>
