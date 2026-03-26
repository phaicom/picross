import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { usePuzzleDomainStore } from '../app/stores/puzzle-domain'
import { usePuzzleSolverStore } from '../app/stores/puzzle-solver'
import { usePuzzleUiStore } from '../app/stores/puzzle-ui'

export function mountPuzzleComponent(component: Component) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const puzzleDomain = usePuzzleDomainStore()
  const puzzleSolver = usePuzzleSolverStore()
  const puzzleUi = usePuzzleUiStore()
  puzzleDomain.initialize()

  const wrapper = mount(component, {
    attachTo: document.body,
    global: {
      plugins: [pinia],
      stubs: {
        Transition: false,
      },
    },
  })

  return {
    puzzleDomain,
    puzzleSolver,
    puzzleUi,
    wrapper,
  }
}

export async function flushUi() {
  await Promise.resolve()
  await nextTick()
}
