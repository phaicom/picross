<template>
  <div relative>
    <!-- BG Layer -->
    <PuzzleBG />
    <!-- Game Layer -->
    <div flex="~ col items-center gap-3" px-6 relative>
      <!-- Timer section -->
      <PuzzleTimer />
      <!-- Board section -->
      <PuzzleBoard />
      <!-- Cell type choosing section -->
      <PuzzlePickCellType mt-1 />
    </div>
  </div>
</template>
