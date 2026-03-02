import type { Puzzle } from '@picross/shared'
import { extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NonParser } from './parsers'
import { readFileSync } from './utils'

const nonParser = new NonParser()

/**
 * Parses a file and returns a Puzzle object.
 *
 * @param path - The path or file URL of the file to parse.
 * @returns The parsed Puzzle object.
 * @throws Error if the file extension is not supported.
 */
export function parser(path: string | URL): Puzzle {
  const pathString = path instanceof URL ? fileURLToPath(path) : path
  const input = readFileSync(path, 'utf-8')
  const extName = extname(pathString).replace('.', '')

  switch (extName) {
    case 'non':
      return nonParser.parse(input.toString())

    default:
      throw new Error(`${extName} file is not supported`)
  }
}
