import type { CurveDefinition } from '@/shared/types'
import { hashSigned, hashUnit } from './shared'

function crossMod(t: number, amount: number, freqX: number, freqY: number) {
  if (amount <= 0) {
    return 0
  }

  return amount * Math.sin(freqX * freqY * t)
}

function wavefold(value: number, amount: number) {
  if (amount <= 0) {
    return value
  }

  const gained = value * (1 + amount * 3)
  return (2 / Math.PI) * Math.asin(Math.sin((Math.PI / 2) * gained))
}

function ringMod(value: number, t: number, modFreq: number) {
  if (modFreq <= 0) {
    return value
  }

  return value * Math.sin(modFreq * t)
}

function getCurvePoint(curve: CurveDefinition, t: number, phaseOffset: number) {
  const localCross = crossMod(t, curve.crossModAmount, curve.freqX, curve.freqY)
  let x = Math.sin(curve.freqX * t + curve.phase + phaseOffset + localCross)
  let y = Math.sin(curve.freqY * t + localCross)

  x = wavefold(x, curve.foldAmount)
  y = wavefold(y, curve.foldAmount)
  x = ringMod(x, t, curve.ringModFreq)
  y = ringMod(y, t, curve.ringModFreq)

  return { x, y }
}

export function fillLissajousPoints(
  buffer: Float32Array,
  curve: CurveDefinition,
  phaseOffset: number,
  width: number,
  height: number,
  depth: number,
  thickness: number,
) {
  const count = buffer.length / 3

  for (let index = 0; index < count; index += 1) {
    const seedBase = index + 1
    const progressJitter = (hashUnit(seedBase * 0.71) - 0.5) * 0.024
    const progress = (index / count + progressJitter + 1) % 1
    const t = progress * Math.PI * 2
    const point = getCurvePoint(curve, t, phaseOffset)
    const nextPoint = getCurvePoint(curve, (progress + 1 / count) * Math.PI * 2, phaseOffset)

    const tangentX = nextPoint.x - point.x
    const tangentY = nextPoint.y - point.y
    const tangentLength = Math.hypot(tangentX, tangentY) || 1
    const normalX = -tangentY / tangentLength
    const normalY = tangentX / tangentLength
    const tangentNormX = tangentX / tangentLength
    const tangentNormY = tangentY / tangentLength
    const densityBand = hashUnit(seedBase * 1.13)
    const spreadBand = densityBand < 0.64 ? 1.7 : densityBand < 0.88 ? 2.7 : 3.8
    const normalOffset = hashSigned(seedBase * 2.17) * thickness * spreadBand
    const tangentOffset = hashSigned(seedBase * 2.61) * thickness * (0.9 + densityBand * 2.4)
    const depthOffset = hashSigned(seedBase * 3.11) * depth * (0.2 + densityBand * 0.6)
    const breathing = Math.sin(t * 4 + phaseOffset * 0.35 + seedBase * 0.002) * thickness * 0.22
    const x = point.x * width + normalX * (normalOffset + breathing) + tangentNormX * tangentOffset
    const y = point.y * height + normalY * (normalOffset + breathing) + tangentNormY * tangentOffset

    buffer[index * 3] = x
    buffer[index * 3 + 1] = y
    buffer[index * 3 + 2] = Math.sin(t * 3.2 + phaseOffset * 0.4) * depth * 0.1 + depthOffset
  }
}
