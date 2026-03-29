import { describe, expect, it } from 'vitest'
import { applyHoldWavefold } from '@/scene/holdWavefold'

function createPositions() {
  return new Float32Array([
    -5.25, -3.5, -1.75,
    -0.5, 0, 0.5,
    1.75, 3.5, 5.25,
  ])
}

describe('applyHoldWavefold', () => {
  it('leaves the buffer unchanged when amount is 0', () => {
    const positions = createPositions()
    const baseline = Array.from(positions)

    applyHoldWavefold(positions, 0, 3)

    expect(Array.from(positions)).toEqual(baseline)
  })

  it('keeps all folded values within the half-range bounds when amount is 1', () => {
    const range = 3
    const halfRange = range / 2
    const positions = createPositions()

    applyHoldWavefold(positions, 1, range)

    expect(Array.from(positions).every((value) => value >= -halfRange && value <= halfRange)).toBe(
      true,
    )
  })

  it('is deterministic for the same input', () => {
    const first = createPositions()
    const second = createPositions()

    applyHoldWavefold(first, 0.65, 3)
    applyHoldWavefold(second, 0.65, 3)

    expect(Array.from(first)).toEqual(Array.from(second))
  })
})
