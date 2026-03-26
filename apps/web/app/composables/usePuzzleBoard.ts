import { computed } from 'vue'
import { usePuzzleDomainStore } from '../stores/puzzle-domain'
import { usePuzzleSolverStore } from '../stores/puzzle-solver'
import { usePuzzleUiStore } from '../stores/puzzle-ui'
import { usePuzzleBoardInteractions } from './usePuzzleBoardInteractions'
import { usePuzzleHintCompletion } from './usePuzzleHintCompletion'

const BOARD_TITLE_ID = 'puzzle-board-title'
const BOARD_INSTRUCTIONS_ID = 'puzzle-board-instructions'

export function usePuzzleBoard() {
  const puzzleDomain = usePuzzleDomainStore()
  const puzzleSolver = usePuzzleSolverStore()
  const puzzleUi = usePuzzleUiStore()
  const { colHintCompletion, rowHintCompletion } = usePuzzleHintCompletion()
  const interactions = usePuzzleBoardInteractions()

  const rowIndices = computed(() => Array.from({ length: puzzleDomain.height }, (_, index) => index))
  const colIndices = computed(() => Array.from({ length: puzzleDomain.width }, (_, index) => index))

  return {
    boardInstructionsId: BOARD_INSTRUCTIONS_ID,
    boardTitleId: BOARD_TITLE_ID,
    clues: computed(() => puzzleDomain.clues),
    colHintCompletion,
    colIndices,
    currentCol: computed(() => puzzleUi.col),
    currentRow: computed(() => puzzleUi.row),
    height: computed(() => puzzleDomain.height),
    isBusy: computed(() => puzzleSolver.isBusy),
    isWin: computed(() => puzzleDomain.isWin),
    rowHintCompletion,
    rowIndices,
    ...interactions,
  }
}
