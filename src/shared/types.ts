export type AppSection = 'home' | 'about' | 'stack' | 'contact'

export type SceneMode =
  | 'homeAlpha'
  | 'aboutBeta'
  | 'aboutFrame'
  | 'stackGamma'
  | 'stackEmbeddingMap'
  | 'contactDelta'
  | 'contactDeltaOut'
  | 'menuGrid'

export type DeviceTier = 'desktop' | 'tablet' | 'mobile' | 'lowPower'

export type LfoWave = 'sine' | 'triangle' | 'saw' | 'random'

export type LfoSlotId = 'lfo1' | 'lfo2' | 'lfo3'

export type PointerState = {
  x: number
  y: number
  inside: boolean
  interactive: boolean
}

export type Capabilities = {
  deviceTier: DeviceTier
  reducedMotion: boolean
  webglSupported: boolean
  isTouch: boolean
}

export type CurveDefinition = {
  freqX: number
  freqY: number
  ampX: number
  ampY: number
  phase: number
  crossModAmount: number
  foldAmount: number
  ringModFreq: number
  speed: number
  animate: boolean
}

export type LfoCurveKey =
  | 'freqX'
  | 'freqY'
  | 'ampX'
  | 'ampY'
  | 'phase'
  | 'crossModAmount'
  | 'foldAmount'
  | 'ringModFreq'
  | 'speed'

export type ParticleTuning = {
  count: number
  sizePx: number
  opacity: number
  strokeWeightPx: number
  jitterPx: number
  haloPx: number
  pointerRadiusPx: number
  pointerStrength: number
  driftMotion: number
  orbitMotion: number
  recovery: number
}

export type LfoParticleKey =
  | 'sizePx'
  | 'opacity'
  | 'strokeWeightPx'
  | 'jitterPx'
  | 'haloPx'
  | 'pointerRadiusPx'
  | 'pointerStrength'
  | 'driftMotion'
  | 'orbitMotion'
  | 'recovery'

export type LfoTarget =
  | {
      scope: 'curve'
      key: LfoCurveKey
    }
  | {
      scope: 'particles'
      key: LfoParticleKey
    }

export type LfoConfig = {
  id: LfoSlotId
  enabled: boolean
  ratio: number
  wave: LfoWave
  amountPct: number
  target: LfoTarget
}

export type LfoBank = readonly [LfoConfig, LfoConfig, LfoConfig]

export type StackCluster = {
  name: string
  slug: string
  weight: number
  colorHint: string
  skills: string[]
}

export type StackSkillGroup = 'ai' | 'design' | 'engineering' | 'tooling' | 'audio'

export type StackSkillSpec = {
  label: string
  group: StackSkillGroup
  densityTier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
}

export type ScenePreset = ParticleTuning & {
  spin: number
  cameraPosition: readonly [number, number, number]
  cameraLookAt: readonly [number, number, number]
  spread: readonly [number, number, number]
}
