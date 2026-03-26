import { CellTypes } from '@picross/shared'
import { computed } from 'vue'
import { usePuzzleDomainStore } from '../stores/puzzle-domain'
import { getFilledRuns } from '../utils/puzzle'

export function usePuzzleHintCompletion() {
  const puzzleDomain = usePuzzleDomainStore()

  const rowHintCompletion = computed(() => {
    return puzzleDomain.clues.rows.map((rowClues, rowIndex) => {
      const rowValues = puzzleDomain.grid[rowIndex] ?? []
      const runs = getFilledRuns(rowValues)
      return rowClues.map((clue, clueIndex) => runs[clueIndex] === clue)
    })
  })

  const colHintCompletion = computed(() => {
    return puzzleDomain.clues.cols.map((colClues, colIndex) => {
      const colValues = Array.from(
        { length: puzzleDomain.height },
        (_, rowIndex) => puzzleDomain.grid[rowIndex]?.[colIndex] ?? CellTypes.Empty,
      )
      const runs = getFilledRuns(colValues)
      return colClues.map((clue, clueIndex) => runs[clueIndex] === clue)
    })
  })

  return {
    colHintCompletion,
    rowHintCompletion,
  }
}
