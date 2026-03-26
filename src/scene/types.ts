import type { StackSkillGroup } from '@/shared/types'

export type StackSkillDatum = {
  id: string
  text: string
  group: StackSkillGroup
  densityTier: number
  position: [number, number, number]
  labelAnchor: [number, number, number]
  radius: number
  particleCount: number
  pointRange: [number, number]
  labelScale: number
}

export type SceneSnapshot = {
  count: number
  targets: Float32Array
  blendTargets: Float32Array | null
  blend: number
  sizePx: number
  opacity: number
  orbit: number
  drift: number
  recovery: number
  pointerRadiusPx: number
  pointerStrength: number
  is3D: boolean
  cameraPosition: [number, number, number]
  cameraLookAt: [number, number, number]
  rotationX: number
  rotationY: number
  rotationZ: number
}

export type StackSceneData = {
  ambientPoints: Float32Array
  skillPoints: Float32Array
  skills: StackSkillDatum[]
  cubeSegments: Float32Array
  gridSegments: Float32Array
}
