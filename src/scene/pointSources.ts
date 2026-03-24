import type { CurveDefinition, StackCluster } from '@/shared/types'
import type { StackLabelDatum } from './types'

type StackCloudResult = {
  points: Float32Array
  labels: StackLabelDatum[]
}

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

export function generateFrameGridPoints(
  width: number,
  height: number,
  cellSize: number,
  depth: number,
): Float32Array {
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
): Float32Array {
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

export function generateNebulaCloud(count: number, clusters: StackCluster[]): StackCloudResult {
  const points = new Float32Array(count * 3)
  const random = mulberry32(8800)
  const totalWeight = clusters.reduce((sum, cluster) => sum + cluster.weight, 0) || 1
  const horizontalScale = 0.76
  const clusterPositions: Record<string, [number, number, number]> = {
    ai: [-1.8 * horizontalScale, 0.86, 0.26],
    design: [-4.8 * horizontalScale, -0.92, -0.44],
    development: [2.7 * horizontalScale, 0.2, 0.38],
    sound: [5.15 * horizontalScale, -1.1, 0.86],
  }
  const clusterSpreads: Record<string, [number, number, number]> = {
    ai: [2.2 * horizontalScale, 1.4, 1.3],
    design: [2.1 * horizontalScale, 1.35, 1.14],
    development: [3.15 * horizontalScale, 1.7, 1.42],
    sound: [1.8 * horizontalScale, 1.15, 1],
  }
  const labels: StackLabelDatum[] = []
  let offset = 0

  clusters.forEach((cluster, clusterIndex) => {
    const center = clusterPositions[cluster.slug] ?? [0, 0, 0]
    const spread = clusterSpreads[cluster.slug] ?? [2.2, 1.2, 1]
    const clusterCount =
      clusterIndex === clusters.length - 1
        ? count - offset
        : Math.floor((count * cluster.weight) / totalWeight)
    const skillAnchors = cluster.skills.map((skill, skillIndex) => {
      const angle = (skillIndex / Math.max(1, cluster.skills.length)) * Math.PI * 2 + clusterIndex * 0.52
      const radius = 0.64 + (skillIndex % 4) * 0.18
      const position: [number, number, number] = [
        center[0] + Math.cos(angle) * spread[0] * radius * 0.58,
        center[1] + Math.sin(angle * 1.16) * spread[1] * 0.42,
        center[2] + Math.sin(angle) * spread[2] * 0.55,
      ]

      labels.push({
        id: `${cluster.slug}-${skillIndex}`,
        text: skill,
        position,
        clusterSlug: cluster.slug,
      })

      return position
    })

    while (offset < count && offset < clusterCount + Math.floor((count * clusters.slice(0, clusterIndex).reduce((sum, item) => sum + item.weight, 0)) / totalWeight)) {
      const anchor = skillAnchors[Math.floor(random() * skillAnchors.length)] ?? center
      const x = anchor[0] + gaussian(random) * spread[0] * 0.3 + Math.sin(offset * 0.09) * 0.12
      const y = anchor[1] + gaussian(random) * spread[1] * 0.34 + Math.cos(offset * 0.07) * 0.08
      const z = anchor[2] + gaussian(random) * spread[2] * 0.48
      const porous = Math.sin(x * 1.05) + Math.cos(y * 1.42) + Math.sin(z * 2.28)

      if (porous > 1.74) {
        continue
      }

      points[offset * 3] = x
      points[offset * 3 + 1] = y
      points[offset * 3 + 2] = z
      offset += 1
    }
  })

  for (let fillIndex = offset; fillIndex < count; fillIndex += 1) {
    const progress = fillIndex / count
    points[fillIndex * 3] = (progress - 0.5) * 8.2
    points[fillIndex * 3 + 1] = Math.sin(progress * Math.PI * 4.4) * 0.92
    points[fillIndex * 3 + 2] = Math.cos(progress * Math.PI * 5.8) * 0.78
  }

  return {
    points,
    labels,
  }
}

export function rotatePointCloudY(source: Float32Array, target: Float32Array, angle: number) {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)

  for (let index = 0; index < source.length; index += 3) {
    const x = source[index]
    const z = source[index + 2]

    target[index] = x * cosine - z * sine
    target[index + 1] = source[index + 1]
    target[index + 2] = x * sine + z * cosine
  }
}
