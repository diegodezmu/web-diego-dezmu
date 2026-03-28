import { describe, expect, it } from 'vitest'
import { fitPointCount } from '@/scene/generators/bufferTransforms'

describe('fitPointCount', () => {
  it('returns the original reference when the point count already matches', () => {
    const source = new Float32Array([1, 2, 3, 4, 5, 6])

    expect(fitPointCount(source, 2)).toBe(source)
  })

  it('expands deterministically by reusing source triplets in order', () => {
    const source = new Float32Array([1, 2, 3, 4, 5, 6])

    expect(Array.from(fitPointCount(source, 4))).toEqual([
      1, 2, 3,
      1, 2, 3,
      4, 5, 6,
      4, 5, 6,
    ])
  })

  it('reduces deterministically and preserves triplet boundaries', () => {
    const source = new Float32Array([
      1, 2, 3,
      4, 5, 6,
      7, 8, 9,
      10, 11, 12,
    ])

    expect(Array.from(fitPointCount(source, 2))).toEqual([
      1, 2, 3,
      7, 8, 9,
    ])
  })
})
