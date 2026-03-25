import type { CurveDefinition, StackGroupLayout, StackSkillSpec } from '@/shared/types'
import type { StackLabelDatum, StackSceneData } from './types'

function mulberry32(seed: number) {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(random: () => number) {
  const u = Math.max(random(), 1e-6)
  const v = Math.max(random(), 1e-6)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function hashUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return value - Math.floor(value)
}

function hashSigned(seed: number) {
  return hashUnit(seed) * 2 - 1
}

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

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

function toTuple(x: number, y: number, z: number): [number, number, number] {
  return [x, y, z]
}

function createAxisSegments() {
  return new Float32Array([
    -3.1, 0, 0, 3.6, 0, 0,
    0, -2.8, 0, 0, 3.2, 0,
    0, 0, -2.8, 0, 0, 2.9,
  ])
}

function createFloorGridSegments(width: number, depth: number, step: number, y: number) {
  const segments: number[] = []
  const halfWidth = width * 0.5
  const halfDepth = depth * 0.5

  for (let x = -halfWidth; x <= halfWidth + 0.0001; x += step) {
    segments.push(x, y, -halfDepth, x, y, halfDepth)
  }

  for (let z = -halfDepth; z <= halfDepth + 0.0001; z += step) {
    segments.push(-halfWidth, y, z, halfWidth, y, z)
  }

  return new Float32Array(segments)
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

export function generateFrameGridPoints(
  width: number,
  height: number,
  cellSize: number,
  depth: number,
) {
  const halfWidth = width * 0.5
  const halfHeight = height * 0.5
  const columns = Math.max(2, Math.round(width / cellSize))
  const rows = Math.max(2, Math.round(height / cellSize))
  const total = columns * 2 + rows * 2 - 4
  const points = new Float32Array(total * 3)
  let offset = 0

  for (let column = 0; column < columns; column += 1) {
    const x = -halfWidth + (column / Math.max(1, columns - 1)) * width
    points[offset * 3] = x
    points[offset * 3 + 1] = halfHeight
    points[offset * 3 + 2] = hashSigned(offset * 1.7) * depth
    offset += 1

    if (column === 0 || column === columns - 1) {
      continue
    }

    points[offset * 3] = x
    points[offset * 3 + 1] = -halfHeight
    points[offset * 3 + 2] = hashSigned(offset * 1.7) * depth
    offset += 1
  }

  for (let row = 1; row < rows - 1; row += 1) {
    const y = halfHeight - (row / Math.max(1, rows - 1)) * height
    points[offset * 3] = -halfWidth
    points[offset * 3 + 1] = y
    points[offset * 3 + 2] = hashSigned(offset * 1.7) * depth
    offset += 1

    points[offset * 3] = halfWidth
    points[offset * 3 + 1] = y
    points[offset * 3 + 2] = hashSigned(offset * 1.7) * depth
    offset += 1
  }

  return points
}

export function generateViewportGridPoints(
  width: number,
  height: number,
  cellSize: number,
  depth: number,
) {
  const halfWidth = width * 0.5
  const halfHeight = height * 0.5
  const columns = Math.max(2, Math.floor(width / cellSize) + 1)
  const rows = Math.max(2, Math.floor(height / cellSize) + 1)
  const points = new Float32Array(columns * rows * 3)
  let offset = 0

  for (let row = 0; row < rows; row += 1) {
    const y = halfHeight - (row / Math.max(1, rows - 1)) * height
    for (let column = 0; column < columns; column += 1) {
      const x = -halfWidth + (column / Math.max(1, columns - 1)) * width
      points[offset * 3] = x
      points[offset * 3 + 1] = y
      points[offset * 3 + 2] = hashSigned(offset * 0.93) * depth
      offset += 1
    }
  }

  return points
}

export function fitPointCount(source: Float32Array, count: number) {
  const sourceCount = source.length / 3

  if (sourceCount === count) {
    return source
  }

  const points = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const sourceIndex = Math.floor((index / count) * sourceCount) % sourceCount
    const sourceOffset = sourceIndex * 3
    const targetOffset = index * 3
    points[targetOffset] = source[sourceOffset]
    points[targetOffset + 1] = source[sourceOffset + 1]
    points[targetOffset + 2] = source[sourceOffset + 2]
  }

  return points
}

export function generateStackSceneData(
  count: number,
  skills: StackSkillSpec[],
  layouts: StackGroupLayout[],
): StackSceneData {
  const points = new Float32Array(count * 3)
  const bridgePoints = new Float32Array(count * 3)
  const labels: StackLabelDatum[] = []
  const connectionSegments: number[] = []
  const clusterBudget = Math.floor(count * 0.84)
  const totalWeight = skills.reduce((sum, skill) => sum + skill.densityTier, 0) || 1
  const rawAllocations = skills.map((skill) => (clusterBudget * skill.densityTier) / totalWeight)
  const allocations = rawAllocations.map((allocation) => Math.floor(allocation))
  let remaining = clusterBudget - allocations.reduce((sum, allocation) => sum + allocation, 0)

  rawAllocations
    .map((allocation, index) => ({
      index,
      remainder: allocation - Math.floor(allocation),
    }))
    .sort((left, right) => right.remainder - left.remainder)
    .forEach(({ index }) => {
      if (remaining <= 0) {
        return
      }

      allocations[index] += 1
      remaining -= 1
    })

  let cursor = 0
  layouts.forEach((layout, groupIndex) => {
    const groupSkills = skills.filter((skill) => skill.group === layout.slug)
    connectionSegments.push(0, 0, 0, layout.center[0], layout.center[1], layout.center[2])

    groupSkills.forEach((skill, skillIndex) => {
      const skillGlobalIndex = skills.indexOf(skill)
      const random = mulberry32(hashString(skill.label))
      const angle =
        (skillIndex / Math.max(1, groupSkills.length)) * Math.PI * 2 + groupIndex * 0.74 + random() * 0.42
      const radial = 0.48 + (skillIndex % 3) * 0.16 + skill.densityTier * 0.04
      const anchor = toTuple(
        layout.center[0] + Math.cos(angle) * layout.spread[0] * radial,
        layout.center[1] + Math.sin(angle * 1.08 + random() * 0.2) * layout.spread[1] * 0.58,
        layout.center[2] + Math.sin(angle * 0.94 - random() * 0.16) * layout.spread[2] * 0.84,
      )

      labels.push({
        id: `${skill.group}-${skill.label}`,
        text: skill.label,
        position: anchor,
        group: skill.group,
        densityTier: skill.densityTier,
      })

      connectionSegments.push(
        layout.center[0],
        layout.center[1],
        layout.center[2],
        anchor[0],
        anchor[1],
        anchor[2],
      )

      const skillCount = allocations[skillGlobalIndex]
      const spreadX = 0.08 + skill.densityTier * 0.026
      const spreadY = 0.06 + skill.densityTier * 0.02
      const spreadZ = 0.08 + skill.densityTier * 0.03

      for (let localIndex = 0; localIndex < skillCount && cursor < clusterBudget; localIndex += 1) {
        const pointRandom = mulberry32(hashString(`${skill.label}-${localIndex}`))
        const x =
          anchor[0] + gaussian(pointRandom) * spreadX + Math.sin(localIndex * 0.12 + angle) * 0.03
        const y =
          anchor[1] + gaussian(pointRandom) * spreadY + Math.cos(localIndex * 0.11 + angle) * 0.025
        const z = anchor[2] + gaussian(pointRandom) * spreadZ

        points[cursor * 3] = x
        points[cursor * 3 + 1] = y
        points[cursor * 3 + 2] = z

        const trunkMix = pointRandom() < 0.38
        const source = trunkMix ? toTuple(0, 0, 0) : layout.center
        const target = trunkMix ? layout.center : anchor
        const mix = trunkMix ? 0.18 + pointRandom() * 0.84 : 0.08 + pointRandom() * 0.9
        const bridgeJitter = 0.018 + skill.densityTier * 0.004

        bridgePoints[cursor * 3] =
          source[0] + (target[0] - source[0]) * mix + gaussian(pointRandom) * bridgeJitter
        bridgePoints[cursor * 3 + 1] =
          source[1] + (target[1] - source[1]) * mix + gaussian(pointRandom) * bridgeJitter
        bridgePoints[cursor * 3 + 2] =
          source[2] + (target[2] - source[2]) * mix + gaussian(pointRandom) * bridgeJitter

        cursor += 1
      }
    })
  })

  for (let index = cursor; index < count; index += 1) {
    const layout = layouts[index % layouts.length]!
    const random = mulberry32(hashString(`ambient-${index}`))
    const x = hashSigned(index * 1.27) * 5.4 + layout.center[0] * 0.18
    const y = hashSigned(index * 1.73) * 3.6 + layout.center[1] * 0.12
    const z = hashSigned(index * 2.11) * 2.6
    points[index * 3] = x
    points[index * 3 + 1] = y
    points[index * 3 + 2] = z
    bridgePoints[index * 3] = x * 0.6 + gaussian(random) * 0.04
    bridgePoints[index * 3 + 1] = y * 0.34 + gaussian(random) * 0.03
    bridgePoints[index * 3 + 2] = z * 0.52 + gaussian(random) * 0.03
  }

  return {
    points,
    bridgePoints,
    labels,
    connectionSegments: new Float32Array(connectionSegments),
    floorSegments: createFloorGridSegments(10.6, 7.8, 0.55, -3.05),
    axisSegments: createAxisSegments(),
  }
}
