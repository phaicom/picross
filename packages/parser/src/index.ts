import type { Puzzle } from '@picross/shared'
import type { PathOrFileDescriptor } from 'node:fs'
import { extname } from 'node:path'
import { NonParser } from './parsers'
import { readFileSync } from './utils'

const nonParser = new NonParser()

/**
 * Parses a file and returns a Puzzle object.
 *
 * @param path - The path or file descriptor of the file to parse.
 * @returns The parsed Puzzle object.
 * @throws Error if the file extension is not supported.
 */
export function parser(path: PathOrFileDescriptor): Puzzle {
  const input = readFileSync(path, 'utf-8')
  const extName = extname(path.toString()).replace('.', '')

  switch (extName) {
    case 'non':
      return nonParser.parse(input.toString())

    default:
      throw new Error(`${extName} file is not supported`)
  }
}
