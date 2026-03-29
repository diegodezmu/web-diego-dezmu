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
    const targets = new Float32Array([
      4, 3, 2,
      1, 0, -1,
      -2, -3, -4,
    ])
    const baseline = Array.from(positions)

    applyRadialExplode(positions, targets, 0, 0, 0, 0)

    expect(Array.from(positions)).toEqual(baseline)
  })

  it('displaces positions by the target offset when amount is 1', () => {
    const positions = new Float32Array([2, 0, 0])
    const targets = new Float32Array([2, 0, 0])

    applyRadialExplode(positions, targets, 1, 0, 0, 0)

    expect(Array.from(positions)).toEqual([4, 0, 0])
  })

  it('is deterministic for the same input', () => {
    const first = createPositions()
    const second = createPositions()
    const targets = new Float32Array([
      1, 2, 3,
      4, 5, 6,
      7, 8, 9,
    ])

    applyRadialExplode(first, targets, 0.6, 0, 0, 0)
    applyRadialExplode(second, targets, 0.6, 0, 0, 0)

    expect(Array.from(first)).toEqual(Array.from(second))
  })

  it('uses a non-zero center correctly', () => {
    const positions = new Float32Array([0, 0, 0])
    const targets = new Float32Array([3, 2, 3])

    applyRadialExplode(positions, targets, 1, 1, 2, 3)

    expect(Array.from(positions)).toEqual([2, 0, 0])
  })

  it('does not create feedback when applied repeatedly with the same targets', () => {
    const positions = new Float32Array([2, 0, 0])
    const targets = new Float32Array([2, 0, 0])

    applyRadialExplode(positions, targets, 1, 0, 0, 0)
    applyRadialExplode(positions, targets, 1, 0, 0, 0)

    expect(Array.from(positions)).toEqual([6, 0, 0])
  })
})
