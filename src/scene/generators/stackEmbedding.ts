import type { StackSkillGroup, StackSkillSpec } from '@/shared/types'
import type { StackSceneData, StackSkillDatum } from '../types'
import { fitPointCount } from './bufferTransforms'
import { createGridSegments } from './grids'
import {
  clamp,
  fillBufferPoint,
  gaussian,
  hashSigned,
  hashString,
  mulberry32,
  toTuple,
} from './shared'

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
    clamp(
      point[1],
      STACK_CUBE_CENTER_Y - STACK_CUBE_HALF + margin,
      STACK_CUBE_CENTER_Y + STACK_CUBE_HALF - margin,
    ),
    clamp(point[2], -STACK_CUBE_HALF + margin, STACK_CUBE_HALF - margin),
  )
}

function createCandidatePoint(group: StackSkillGroup, seed: string, radius: number) {
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

  return toTuple(position[0] - 0.35, position[1] + vertical, position[2] + depthOffset)
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

type StackTransitionMappingOptions = {
  scaleX: number
  scaleY: number
  scaleZ: number
  depthJitter: number
  lateralJitter: number
  verticalJitter: number
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
    gridSegments: createGridSegments(STACK_CUBE_SIZE, STACK_CUBE_CENTER_Y, STACK_CUBE_DIVISIONS),
  }
}
