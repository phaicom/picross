import type { Puzzle } from '@picross/shared'
import { BaseParser } from './base'

/**
 * Represents a parser for Non files.
 */
export class NonParser extends BaseParser {
  /**
   * Parses the input string and returns a Puzzle object.
   * @param input - The input string to parse.
   * @returns The parsed Puzzle object.
   * @throws {Error} If the non file structure is incorrect.
   * @throws {Error} If the non file key is incorrect.
   */
  parse(input: string): Puzzle {
    const sections = input.split('\n\n')
    if (sections.length < 3)
      throw new Error('Incorrect non file structure')

    const dataSection = sections[0]
    const cluesSections = sections.slice(1, 3)
    if (!dataSection || cluesSections.length < 2)
      throw new Error('Incorrect non file structure')

    this.parseDataSection(dataSection)
    this.parseCluesSection(cluesSections)

    return this.puzzle
  }

  /**
   * Parses the data section of the non file.
   * @param data - The data section string to parse.
   * @throws {Error} If the non file key is incorrect.
   */
  private parseDataSection(data: string): void {
    for (const line of data.split('\n')) {
      const [key, value] = line.indexOf('"') > 0 ? line.split('"') : line.split(' ')
      if (key === undefined || value === undefined)
        throw new Error('Incorrect non file key')

      const trimmedKey = key.trim()
      const trimmedValue = value.trim()

      if (trimmedKey in this.puzzle)
        (this.puzzle as any)[trimmedKey] = trimmedValue
      else if (trimmedKey === 'by')
        this.puzzle.author = trimmedValue
      else
        throw new Error('Incorrect non file key')
    }

    this.puzzle.width = Number(this.puzzle.width)
    this.puzzle.height = Number(this.puzzle.height)
  }

  /**
   * Parses the clues section of the non file.
   * @param sections - The array of clues section strings to parse.
   * @throws {Error} If the non file key is incorrect.
   */
  private parseCluesSection(sections: string[]): void {
    this.puzzle.clues = { rows: [], cols: [] }

    sections.forEach((section) => {
      const lines = section.split('\n')
      const key = lines.shift()

      if (!['rows', 'columns'].includes(key || ''))
        throw new Error('Incorrect non file key')

      const clues = lines.map(line => line.split(',').map(Number))
      this.puzzle.clues[key === 'rows' ? 'rows' : 'cols'] = clues
    })
  }
}
