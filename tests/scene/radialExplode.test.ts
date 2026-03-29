import { describe, expect, it } from 'vitest'
import { applyRadialExplode } from '@/scene/radialExplode'

function createPositions() {
  return new Float32Array([
    -2, -1, -0.5,
    0.5, 1, 2,
    3, 4, 5,
  ])
}

describe('applyRadialExplode', () => {
  it('leaves the buffer unchanged when amount is 0', () => {
    const positions = createPositions()
    const baseline = Array.from(positions)

    applyRadialExplode(positions, 0, 2, 0, 0, 0)

    expect(Array.from(positions)).toEqual(baseline)
  })

  it('doubles every component when amount is 1 and strength is 1 around the origin', () => {
    const positions = createPositions()

    applyRadialExplode(positions, 1, 1, 0, 0, 0)

    expect(Array.from(positions)).toEqual([
      -4, -2, -1,
      1, 2, 4,
      6, 8, 10,
    ])
  })

  it('is deterministic for the same input', () => {
    const first = createPositions()
    const second = createPositions()

    applyRadialExplode(first, 0.6, 2, 0, 0, 0)
    applyRadialExplode(second, 0.6, 2, 0, 0, 0)

    expect(Array.from(first)).toEqual(Array.from(second))
  })

  it('does not move a particle located exactly at the provided center', () => {
    const positions = new Float32Array([
      1, 2, 3,
      4, 5, 6,
    ])

    applyRadialExplode(positions, 1, 2, 1, 2, 3)

    expect(Array.from(positions.slice(0, 3))).toEqual([1, 2, 3])
  })
})
