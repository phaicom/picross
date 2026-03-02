<template>
  <div h-full min-h-0 min-w-0 w-full relative overflow-hidden>
    <!-- BG Layer -->
    <PuzzleBG />
    <!-- Game Layer -->
    <div
      grid="~ rows-[max-content_minmax(0,1fr)_max-content]"

      px-6 py-3 gap-3 h-full min-h-0 min-w-0 w-full relative overflow-hidden
    >
      <!-- Timer section -->
      <PuzzleTimer />
      <!-- Board section -->
      <PuzzleBoard />
      <!-- Cell type choosing section -->
      <PuzzlePickCellType />
    </div>
  </div>
</template>
