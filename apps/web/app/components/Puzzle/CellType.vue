<script setup lang="ts">
import { CellTypes } from '@picross/shared'

const prop = defineProps<{
  cellType: CellTypes
}>()
</script>

<template>
  <div v-if="prop.cellType === CellTypes.Fill" class="bg-my-dark-violet-70 h-full w-full" />
  <div v-else-if="prop.cellType === CellTypes.Cross" class="i-ph-x-bold text-my-red" />
  <div v-else-if="prop.cellType === CellTypes.Circle" class="i-ph-circle-bold text-my-sky-blue" />
</template>
