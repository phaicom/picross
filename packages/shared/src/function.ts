/**
 * Generates an iterable range of numbers from `start` (inclusive) to `end` (exclusive).
 *
 * @param start - The starting number of the range.
 * @param end - The ending number of the range.
 * @returns An iterable range of numbers.
 */
export function* range(start: number, end: number): Iterable<number> {
  for (let i = start; i < end; i++)
    yield i
}

/**
 * Returns the last element of an array.
 *
 * @template T - The type of the elements in the array.
 * @param {T[]} arr - The input array.
 * @returns {T} - The last element of the array.
 * @throws {Error} - If the array is empty.
 */
export function last<T>(arr: T[]): T {
  const length = arr.length
  if (length === 0)
    throw new Error('Array is empty')

  return arr[length - 1]!
}

/**
 * Generates combinations of numbers from 0 to `a-1` of length `len`.
 *
 * @param ub - The upper bound (exclusive) for the numbers to generate combinations from.
 * @param len - The length of each combination.
 * @param cur - The current combination being generated (optional).
 * @returns An iterable iterator that generates combinations of numbers.
 */
function* _combination(ub: number, len: number, cur: number[] = []): IterableIterator<number[]> {
  const index = cur.length
  if (index === len) {
    yield cur
    return
  }
  const start = index ? last(cur) + 1 : 0
  const end = ub - len + index
  for (const next of range(start, end + 1))
    yield* _combination(ub, len, cur.concat(next))
}

/**
 * Generates combinations of elements from an array.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The input array.
 * @param {number} len - The length of each combination.
 * @returns {Iterable<T[]>} - An iterable of combinations.
 */
export function* combination<T>(arr: T[], len: number): Iterable<T[]> {
  const length = arr.length
  const combinations: T[][] = []

  for (const index of _combination(length, len)) {
    combinations.push(index.map((i) => {
      if (!(i in arr))
        throw new Error(`Index ${i} is out of bounds`)

      return arr[i] as T
    }))
  }

  yield* combinations
}
