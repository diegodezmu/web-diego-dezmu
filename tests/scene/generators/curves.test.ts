import { describe, expect, it } from 'vitest'
import type { CurveDefinition } from '@/shared/types'
import { fillLissajousPoints } from '@/scene/generators/curves'

const curve: CurveDefinition = {
  freqX: 3,
  freqY: 2,
  ampX: 1,
  ampY: 1,
  phase: Math.PI / 4,
  crossModAmount: 0.12,
  foldAmount: 0.18,
  ringModFreq: 1.4,
  speed: 1,
  animate: true,
}

function createBuffer() {
  return new Float32Array(30)
}

describe('fillLissajousPoints', () => {
  it('fills the same buffer deterministically for the same inputs', () => {
    const first = createBuffer()
    const second = createBuffer()

    fillLissajousPoints(first, curve, 0.5, 10, 6, 2, 0.4)
    fillLissajousPoints(second, curve, 0.5, 10, 6, 2, 0.4)

    expect(Array.from(first)).toEqual(Array.from(second))
  })

  it('changes the generated positions when phaseOffset changes', () => {
    const baseline = createBuffer()
    const shifted = createBuffer()

    fillLissajousPoints(baseline, curve, 0.25, 10, 6, 2, 0.4)
    fillLissajousPoints(shifted, curve, 1.25, 10, 6, 2, 0.4)

    expect(Array.from(shifted)).not.toEqual(Array.from(baseline))
  })

  it('writes only finite values and keeps z at zero when depth is zero', () => {
    const buffer = createBuffer()

    fillLissajousPoints(buffer, curve, 0.75, 12, 8, 0, 0.35)

    expect(Array.from(buffer).every(Number.isFinite)).toBe(true)
    expect(
      Array.from({ length: buffer.length / 3 }, (_, index) => buffer[index * 3 + 2]),
    ).toEqual(expect.arrayContaining(new Array(buffer.length / 3).fill(0)))
    expect(
      Array.from({ length: buffer.length / 3 }, (_, index) => buffer[index * 3 + 2]).every(
        (value) => value === 0,
      ),
    ).toBe(true)
  })
})
