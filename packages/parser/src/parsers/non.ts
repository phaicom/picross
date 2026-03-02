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
    this.resetPuzzle()

    const normalizedInput = input.replace(/\r\n/g, '\n')
    const sections = normalizedInput.split(/\n\s*\n/).filter(section => section.trim().length > 0)
    if (sections.length < 3)
      throw new Error('Incorrect non file structure')

    const dataSection = sections[0]
    const cluesSections = sections.slice(1, 3)
    if (!dataSection || cluesSections.length < 2)
      throw new Error('Incorrect non file structure')

    this.parseDataSection(dataSection)
    this.parseCluesSection(cluesSections)
    this.validateParsedPuzzle()

    return {
      ...this.puzzle,
      clues: {
        rows: this.puzzle.clues.rows.map(row => [...row]),
        cols: this.puzzle.clues.cols.map(col => [...col]),
      },
    }
  }

  /**
   * Parses the data section of the non file.
   * @param data - The data section string to parse.
   * @throws {Error} If the non file key is incorrect.
   */
  private parseDataSection(data: string): void {
    const lines = data.split('\n').map(line => line.trim()).filter(Boolean)
    for (const [index, line] of lines.entries()) {
      const separatorIndex = line.search(/\s/)
      if (separatorIndex <= 0)
        throw new Error(`Incorrect non file key at metadata line ${index + 1}`)

      const key = line.slice(0, separatorIndex).trim().toLowerCase()
      const rawValue = line.slice(separatorIndex).trim()
      const value = rawValue.startsWith('"')
        ? this.parseQuotedValue(rawValue, key, index)
        : rawValue
      switch (key) {
        case 'catalogue':
          this.puzzle.catalogue = value
          break
        case 'title':
          this.puzzle.title = value
          break
        case 'copyright':
          this.puzzle.copyright = value
          break
        case 'by':
          this.puzzle.author = value
          break
        case 'width':
          this.puzzle.width = this.parsePositiveInteger(value, 'width')
          break
        case 'height':
          this.puzzle.height = this.parsePositiveInteger(value, 'height')
          break
        default:
          throw new Error(`Incorrect non file key '${key}'`)
      }
    }
  }

  /**
   * Parses the clues section of the non file.
   * @param sections - The array of clues section strings to parse.
   * @throws {Error} If the non file key is incorrect.
   */
  private parseCluesSection(sections: string[]): void {
    this.puzzle.clues = { rows: [], cols: [] }

    sections.forEach((section, sectionIndex) => {
      const lines = section.split('\n').map(line => line.trim())
      const key = lines.shift()?.toLowerCase()

      if (!['rows', 'columns'].includes(key || ''))
        throw new Error(`Incorrect non file key in clues section ${sectionIndex + 1}`)

      const clues = lines.filter(Boolean).map((line, lineIndex) => this.parseClueLine(line, key as 'rows' | 'columns', lineIndex))
      this.puzzle.clues[key === 'rows' ? 'rows' : 'cols'] = clues
    })
  }

  private parsePositiveInteger(value: string, key: 'width' | 'height'): number {
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed <= 0)
      throw new Error(`Invalid ${key}: ${value}`)
    return parsed
  }

  private parseQuotedValue(value: string, key: string, lineIndex: number): string {
    if (!value.endsWith('"') || value.length < 2)
      throw new Error(`Invalid quoted value for '${key}' at metadata line ${lineIndex + 1}`)

    return value.slice(1, -1)
  }

  private parseClueLine(line: string, section: 'rows' | 'columns', lineIndex: number): number[] {
    if (line === '0')
      return []

    const values = line.split(',').map(part => part.trim())
    if (values.some(part => part.length === 0))
      throw new Error(`Invalid clue format in ${section} line ${lineIndex + 1}`)

    const clues = values.map((part) => {
      const parsed = Number(part)
      if (!Number.isInteger(parsed) || parsed <= 0)
        throw new Error(`Invalid clue value '${part}' in ${section} line ${lineIndex + 1}`)
      return parsed
    })

    return clues
  }

  private validateParsedPuzzle(): void {
    const { width, height, clues } = this.puzzle
    if (width <= 0 || height <= 0)
      throw new Error('Width and height must be positive integers')

    if (clues.rows.length !== height)
      throw new Error(`Rows clues count ${clues.rows.length} does not match height ${height}`)

    if (clues.cols.length !== width)
      throw new Error(`Columns clues count ${clues.cols.length} does not match width ${width}`)

    clues.rows.forEach((line, index) => this.validateLineFit(line, width, 'rows', index))
    clues.cols.forEach((line, index) => this.validateLineFit(line, height, 'columns', index))
  }

  private validateLineFit(line: number[], limit: number, section: 'rows' | 'columns', lineIndex: number): void {
    if (line.length === 0)
      return

    const required = line.reduce((sum, n) => sum + n, 0) + line.length - 1
    if (required > limit)
      throw new Error(`Clues exceed ${section} length at line ${lineIndex + 1}`)
  }
}
