import type { CurveDefinition, StackSkillGroup, StackSkillSpec } from '@/shared/types'
import type { StackSceneData, StackSkillDatum } from './types'

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const STACK_CUBE_SIZE = 10
const STACK_CUBE_HALF = STACK_CUBE_SIZE * 0.5
export const STACK_CUBE_CENTER_Y = STACK_CUBE_HALF * 0.5 + 0.5
const STACK_CUBE_DIVISIONS = 8
const STACK_PARTICLE_COUNT_BY_TIER = {
  1: 22,
  2: 30,
  3: 38,
  4: 46,
  5: 54,
  6: 62,
  7: 73,
  8: 84,
  9: 96,
  10: 108,
} as const
const STACK_RADIUS_BY_TIER = {
  1: 0.15,
  2: 0.18,
  3: 0.21,
  4: 0.24,
  5: 0.28,
  6: 0.31,
  7: 0.36,
  8: 0.4,
  9: 0.45,
  10: 0.5,
} as const
const STACK_LABEL_SCALE_BY_TIER = {
  1: 0.66,
  2: 0.72,
  3: 0.78,
  4: 0.84,
  5: 0.91,
  6: 0.98,
  7: 1.05,
  8: 1.12,
  9: 1.19,
  10: 1.26,
} as const
const STACK_CLUSTER_LAYOUTS: Record<
  StackSkillGroup,
  { center: [number, number, number]; spread: [number, number, number] }
> = {
  engineering: {
    center: [-2.45, 3.1, -2.2],
    spread: [1.38, 0.92, 1.08],
  },
  design: {
    center: [2.2, 3.2, -1.9],
    spread: [1.26, 0.92, 1.02],
  },
  ai: {
    center: [2.45, 0.9, 2.15],
    spread: [1.34, 0.98, 1.08],
  },
  tooling: {
    center: [-2.35, 1.0, 2.35],
    spread: [1.44, 0.96, 1.12],
  },
  audio: {
    center: [0.08, 1.95, 0.2],
    spread: [1.14, 0.72, 0.98],
  },
}

function fillBufferPoint(buffer: Float32Array, index: number, point: [number, number, number]) {
  const offset = index * 3
  buffer[offset] = point[0]
  buffer[offset + 1] = point[1]
  buffer[offset + 2] = point[2]
}

function appendSegment(segments: number[], start: [number, number, number], end: [number, number, number]) {
  segments.push(start[0], start[1], start[2], end[0], end[1], end[2])
}

function createCubeSegments(size: number, centerY: number) {
  void size
  void centerY
  return new Float32Array(0)
}

function createGridSegments(size: number, centerY: number, divisions: number) {
  const half = size * 0.5
  const step = size / divisions
  const bottom = centerY - half
  const segments: number[] = []

  for (let index = 1; index < divisions; index += 1) {
    const t = -half + index * step

    appendSegment(segments, [t, bottom, -half], [t, bottom, half])
    appendSegment(segments, [-half, bottom, t], [half, bottom, t])
  }

  return new Float32Array(segments)
}

function allocateSkillParticleCounts(skills: StackSkillSpec[], budget: number) {
  const raw = skills.map((skill) => STACK_PARTICLE_COUNT_BY_TIER[skill.densityTier])
  const totalBase = raw.reduce((sum, value) => sum + value, 0) || 1
  const scaled = raw.map((value) => (value / totalBase) * budget)
  const counts = scaled.map((value) => Math.floor(value))
  let remaining = budget - counts.reduce((sum, value) => sum + value, 0)

  scaled
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((left, right) => right.remainder - left.remainder)
    .forEach(({ index }) => {
      if (remaining <= 0) {
        return
      }

      counts[index] += 1
      remaining -= 1
    })

  return counts
}

function clampPointToCube(point: [number, number, number], margin: number) {
  return toTuple(
    clamp(point[0], -STACK_CUBE_HALF + margin, STACK_CUBE_HALF - margin),
    clamp(point[1], STACK_CUBE_CENTER_Y - STACK_CUBE_HALF + margin, STACK_CUBE_CENTER_Y + STACK_CUBE_HALF - margin),
    clamp(point[2], -STACK_CUBE_HALF + margin, STACK_CUBE_HALF - margin),
  )
}

function createCandidatePoint(
  group: StackSkillGroup,
  seed: string,
  radius: number,
) {
  const layout = STACK_CLUSTER_LAYOUTS[group]
  const random = mulberry32(hashString(seed))
  const point = toTuple(
    layout.center[0] + gaussian(random) * layout.spread[0],
    layout.center[1] + gaussian(random) * layout.spread[1],
    layout.center[2] + gaussian(random) * layout.spread[2],
  )

  return clampPointToCube(point, radius + 0.25)
}

function getAnchorDistance(left: [number, number, number], right: [number, number, number]) {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2])
}

function createLabelAnchor(position: [number, number, number], radius: number, text: string) {
  const depthOffset = clamp(position[2] * 0.035, -0.12, 0.12)
  const vertical = 0.22 + radius * 0.9 + text.length * 0.002

  return toTuple(
    position[0] - 0.35,
    position[1] + vertical,
    position[2] + depthOffset,
  )
}

function createSkillAnchors(skills: StackSkillSpec[], counts: number[]) {
  const skillsByGroup = new Map<StackSkillGroup, Array<{ skill: StackSkillSpec; index: number }>>()

  skills.forEach((skill, index) => {
    const bucket = skillsByGroup.get(skill.group) ?? []
    bucket.push({ skill, index })
    skillsByGroup.set(skill.group, bucket)
  })

  const anchors: StackSkillDatum[] = new Array(skills.length)

  skillsByGroup.forEach((groupSkills, group) => {
    const placed: StackSkillDatum[] = []

    groupSkills
      .sort((left, right) => right.skill.densityTier - left.skill.densityTier || left.index - right.index)
      .forEach(({ skill, index }) => {
        const radius = STACK_RADIUS_BY_TIER[skill.densityTier]
        let bestPoint = createCandidatePoint(group, `${skill.label}-fallback`, radius)
        let bestDistance = Number.NEGATIVE_INFINITY

        for (let attempt = 0; attempt < 56; attempt += 1) {
          const candidate = createCandidatePoint(group, `${skill.label}-${attempt}`, radius)
          const minDistance = placed.length
            ? Math.min(...placed.map((placedSkill) => getAnchorDistance(placedSkill.position, candidate)))
            : 99
          const center = STACK_CLUSTER_LAYOUTS[group].center
          const toCenter = getAnchorDistance(candidate, center)
          const score = minDistance * 1.8 - toCenter * 0.42

          if (score > bestDistance) {
            bestDistance = score
            bestPoint = candidate
          }
        }

        const skillDatum: StackSkillDatum = {
          id: `${skill.group}-${skill.label}`,
          text: skill.label,
          group: skill.group,
          densityTier: skill.densityTier,
          position: bestPoint,
          labelAnchor: createLabelAnchor(bestPoint, radius, skill.label),
          radius,
          particleCount: counts[index] ?? STACK_PARTICLE_COUNT_BY_TIER[skill.densityTier],
          pointRange: [0, 0],
          labelScale: STACK_LABEL_SCALE_BY_TIER[skill.densityTier],
        }

        placed.push(skillDatum)
        anchors[index] = skillDatum
      })
  })

  return anchors.filter(Boolean)
}

function fillSkillSpherePoints(
  buffer: Float32Array,
  startIndex: number,
  skill: StackSkillDatum,
) {
  let cursor = startIndex

  for (let localIndex = 0; localIndex < skill.particleCount; localIndex += 1) {
    const random = mulberry32(hashString(`${skill.id}-${localIndex}`))
    const azimuth = random() * Math.PI * 2
    const cosTheta = clamp(hashSigned((localIndex + 1) * 0.37), -1, 1)
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta)
    const radius = Math.pow(random(), 0.62) * skill.radius
    const x =
      skill.position[0] +
      Math.cos(azimuth) * sinTheta * radius +
      gaussian(random) * skill.radius * 0.035
    const y =
      skill.position[1] +
      Math.sin(azimuth) * sinTheta * radius +
      gaussian(random) * skill.radius * 0.03
    const z =
      skill.position[2] +
      cosTheta * radius +
      gaussian(random) * skill.radius * 0.04

    fillBufferPoint(buffer, cursor, toTuple(x, y, z))
    cursor += 1
  }

  return cursor
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

export function generateMarginGridPoints(
  width: number,
  height: number,
  cellSize: number,
  marginX: number,
  marginY: number,
  depth: number,
) {
  const halfWidth = width * 0.5
  const halfHeight = height * 0.5
  const columns = Math.max(2, Math.floor(width / cellSize) + 1)
  const rows = Math.max(2, Math.floor(height / cellSize) + 1)
  const innerHalfWidth = Math.max(0, halfWidth - marginX)
  const innerHalfHeight = Math.max(0, halfHeight - marginY)
  const points: number[] = []
  let offset = 0

  for (let row = 0; row < rows; row += 1) {
    const y = halfHeight - (row / Math.max(1, rows - 1)) * height

    for (let column = 0; column < columns; column += 1) {
      const x = -halfWidth + (column / Math.max(1, columns - 1)) * width

      if (Math.abs(x) < innerHalfWidth && Math.abs(y) < innerHalfHeight) {
        continue
      }

      points.push(x, y, hashSigned(offset * 0.93) * depth)
      offset += 1
    }
  }

  return new Float32Array(points)
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

type StackTransitionMappingOptions = {
  scaleX: number
  scaleY: number
  scaleZ: number
  depthJitter: number
  lateralJitter: number
  verticalJitter: number
}

export function flattenStackPointsForTransition(source: Float32Array, count: number) {
  const fitted = fitPointCount(source, count)
  const flattened = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    const centeredY = fitted[offset + 1] - STACK_CUBE_CENTER_Y

    flattened[offset] =
      fitted[offset] * 0.56 + hashSigned((index + 1) * 0.77) * 0.042
    flattened[offset + 1] =
      centeredY * 0.46 + hashSigned((index + 1) * 1.11) * 0.034
    flattened[offset + 2] =
      fitted[offset + 2] * 0.18 + hashSigned((index + 1) * 1.49) * 0.072
  }

  return flattened
}

export function mapTransitionPointsToStack(
  source: Float32Array,
  count: number,
  options: Partial<StackTransitionMappingOptions> = {},
) {
  const fitted = fitPointCount(source, count)
  const mapped = new Float32Array(count * 3)
  const settings: StackTransitionMappingOptions = {
    scaleX: 2.08,
    scaleY: 2.26,
    scaleZ: 0.84,
    depthJitter: 1.28,
    lateralJitter: 0.09,
    verticalJitter: 0.08,
    ...options,
  }

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    const x =
      fitted[offset] * settings.scaleX +
      hashSigned((index + 1) * 0.71) * settings.lateralJitter
    const y =
      STACK_CUBE_CENTER_Y +
      fitted[offset + 1] * settings.scaleY +
      hashSigned((index + 1) * 1.07) * settings.verticalJitter
    const z =
      fitted[offset + 2] * settings.scaleZ +
      hashSigned((index + 1) * 1.39) * settings.depthJitter

    mapped[offset] = clamp(x, -STACK_CUBE_HALF + 0.14, STACK_CUBE_HALF - 0.14)
    mapped[offset + 1] = clamp(
      y,
      STACK_CUBE_CENTER_Y - STACK_CUBE_HALF + 0.14,
      STACK_CUBE_CENTER_Y + STACK_CUBE_HALF - 0.14,
    )
    mapped[offset + 2] = clamp(z, -STACK_CUBE_HALF + 0.14, STACK_CUBE_HALF - 0.14)
  }

  return mapped
}

export function generateStackSceneData(
  count: number,
  skills: StackSkillSpec[],
): StackSceneData {
  const skillBudget = count
  const ambientPoints = new Float32Array(0)
  const skillPoints = new Float32Array(skillBudget * 3)
  const skillCounts = allocateSkillParticleCounts(skills, skillBudget)
  const skillData = createSkillAnchors(skills, skillCounts)

  let cursor = 0
  skillData.forEach((skill, skillIndex) => {
    const start = cursor
    cursor = fillSkillSpherePoints(skillPoints, cursor, skill)
    skillData[skillIndex] = {
      ...skill,
      pointRange: [start, cursor],
    }
  })

  return {
    ambientPoints,
    skillPoints,
    skills: skillData,
    cubeSegments: createCubeSegments(STACK_CUBE_SIZE, STACK_CUBE_CENTER_Y),
    gridSegments: createGridSegments(STACK_CUBE_SIZE, STACK_CUBE_CENTER_Y, STACK_CUBE_DIVISIONS),
  }
}
