import fs from 'node:fs'
import path from 'node:path'

const ROOT_PATH = new URL(`${path.dirname(import.meta.url)}`).pathname

/**
 * Synchronously reads the entire contents of a file.
 *
 * @param filePath - The path to the file to be read.
 * @param options - The encoding or options object.
 * @returns The contents of the file.
 */
export function readFileSync(filePath: string | URL, options?:
  | {
    encoding: BufferEncoding
    flag?: string | undefined
  }
  | BufferEncoding) {
  const resolvedPath = path.resolve(ROOT_PATH, filePath.toString())
  return fs.readFileSync(resolvedPath, options)
}
