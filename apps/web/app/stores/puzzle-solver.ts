import type { SolveResult, SolverStatus } from '@picross/core'
import type { SolverPreset } from '../utils/puzzle'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { getPresetOptions, normalizeSolvedGrid } from '../utils/puzzle'
import { solvePuzzle } from '../utils/solver-runner'
import { usePuzzleDomainStore } from './puzzle-domain'

const PLAYBACK_DELAY_MS = 300

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'undefined') {
      resolve()
      return
    }

    requestAnimationFrame(() => resolve())
  })
}

export const usePuzzleSolverStore = defineStore('puzzle-solver', () => {
  const domain = usePuzzleDomainStore()
  const solverPreset = ref<SolverPreset>('normal')
  const solverStatus = ref<SolverStatus>('stalled')
  const solverTimedOut = ref(false)
  const isSolving = ref(false)
  const isAnimating = ref(false)
  const isBusy = computed(() => isSolving.value || isAnimating.value)

  let playbackInterval: ReturnType<typeof setInterval> | null = null
  let requestToken = 0

  function clearPlaybackInterval() {
    if (!playbackInterval)
      return

    clearInterval(playbackInterval)
    playbackInterval = null
  }

  function resetSolverFeedback() {
    solverStatus.value = 'stalled'
    solverTimedOut.value = false
  }

  function resetSolverState() {
    requestToken += 1
    clearPlaybackInterval()
    resetSolverFeedback()
    isSolving.value = false
    isAnimating.value = false
  }

  function setSolverPreset(preset: SolverPreset) {
    solverPreset.value = preset
  }

  function applySolveResult(result: SolveResult) {
    domain.setSolution(result.board)
    solverStatus.value = result.status
    solverTimedOut.value = result.timedOut
  }

  function playSolveSteps(result: SolveResult, token: number): Promise<void> {
    const frames = result.solveSteps.map(step => step.map(row => [...row]))
    const finalBoard = normalizeSolvedGrid(result.board)

    if (frames.length === 0) {
      domain.replaceGrid(finalBoard)
      return Promise.resolve()
    }

    domain.resetBoard()
    isAnimating.value = true

    return new Promise<void>((resolve) => {
      let frameIndex = 0
      clearPlaybackInterval()
      playbackInterval = setInterval(() => {
        if (token !== requestToken) {
          clearPlaybackInterval()
          isAnimating.value = false
          resolve()
          return
        }

        const frame = frames[frameIndex]
        if (frame)
          domain.replaceGrid(frame)

        frameIndex += 1
        if (frameIndex >= frames.length) {
          clearPlaybackInterval()
          domain.replaceGrid(finalBoard)
          isAnimating.value = false
          resolve()
        }
      }, PLAYBACK_DELAY_MS)
    })
  }

  async function startSolver(): Promise<void> {
    if (isBusy.value)
      return

    const token = requestToken + 1
    requestToken = token
    clearPlaybackInterval()
    resetSolverFeedback()
    isSolving.value = true

    try {
      await nextTick()
      await waitForNextPaint()

      const result = await solvePuzzle(domain.clues, getPresetOptions(solverPreset.value, domain.width, domain.height))
      if (token !== requestToken)
        return

      applySolveResult(result)
      isSolving.value = false
      await playSolveSteps(result, token)
    }
    finally {
      if (token === requestToken) {
        isSolving.value = false
        isAnimating.value = false
      }
    }
  }

  return {
    isAnimating,
    isBusy,
    isSolving,
    resetSolverState,
    setSolverPreset,
    solverPreset,
    solverStatus,
    solverTimedOut,
    startSolver,
    stopSolver: resetSolverState,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePuzzleSolverStore, import.meta.hot))
