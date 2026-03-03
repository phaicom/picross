<template>
  <div flex="~ row gap-2 justify-center" text-2xl mb-4>
    <h1
      class="text-transparent font-bold text-center bg-[length:20em_100%] bg-[linear-gradient(to_left_in_hsl,hsl(359deg_100%_50%),hsl(180deg_100%_50%),hsl(0deg_100%_50%))] uppercase animate-pulse bg-clip-text"
    >
      <slot />
    </h1>
    <span>🏆🎖️🫡</span>
  </div>
</template>
