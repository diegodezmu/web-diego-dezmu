import type {
  CurveDefinition,
  LfoBank,
  LfoConfig,
  LfoCurveKey,
  LfoParticleKey,
  LfoWave,
  ParticleTuning,
} from '@/shared/types'

type NumericRange = {
  min: number
  max: number
}

type ResolveLfoSceneParametersOptions = {
  sceneKey: string
  curve: CurveDefinition
  particles: ParticleTuning
  lfos: LfoBank
  elapsedTime: number
  reducedMotion: boolean
}

type ResolvedLfoSceneParameters = {
  curve: CurveDefinition
  particles: ParticleTuning
}

const CURVE_PARAMETER_RANGES: Record<LfoCurveKey, NumericRange> = {
  freqX: { min: 1, max: 12 },
  freqY: { min: 1, max: 12 },
  ampX: { min: 0, max: 1 },
  ampY: { min: 0, max: 1 },
  phase: { min: 0, max: Math.PI * 2 },
  crossModAmount: { min: 0, max: Math.PI * 1.5 },
  foldAmount: { min: 0, max: 5 },
  ringModFreq: { min: 0, max: 12 },
  speed: { min: 0, max: 0.06 },
}

const PARTICLE_PARAMETER_RANGES: Record<LfoParticleKey, NumericRange> = {
  sizePx: { min: 0, max: 8 },
  opacity: { min: 0, max: 1 },
  glowBoost: { min: 0, max: 2 },
  strokeWeightPx: { min: 0, max: 3 },
  jitterPx: { min: 0, max: 20 },
  haloPx: { min: 0, max: 24 },
  pointerRadiusPx: { min: 0, max: 240 },
  pointerStrength: { min: 0, max: 0.24 },
  driftMotion: { min: 0, max: 0.03 },
  orbitMotion: { min: 0, max: 0.03 },
  recovery: { min: 0, max: 0.03 },
}

const LFO_VISUAL_MIN_RATE_HZ = 0.05
const LFO_VISUAL_MAX_RATE_HZ = 1.5
const LFO_VISUAL_RATE_EXPONENT = 1.5

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function inverseLerp(min: number, max: number, value: number) {
  if (max <= min) {
    return 0
  }

  return clamp((value - min) / (max - min), 0, 1)
}

function fract(value: number) {
  return value - Math.floor(value)
}

function reflectUnit(value: number) {
  const wrapped = ((value % 2) + 2) % 2
  return wrapped <= 1 ? wrapped : 2 - wrapped
}

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function hashUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return value - Math.floor(value)
}

function resolveVisualRateHz(ratio: number) {
  const normalizedRatio = clamp(ratio, 0, 1) ** LFO_VISUAL_RATE_EXPONENT
  return LFO_VISUAL_MIN_RATE_HZ + normalizedRatio * (LFO_VISUAL_MAX_RATE_HZ - LFO_VISUAL_MIN_RATE_HZ)
}

function evaluateBaseWave(wave: Exclude<LfoWave, 'random'>, phase: number) {
  switch (wave) {
    case 'triangle':
      return 1 - 4 * Math.abs(fract(phase + 0.25) - 0.5)
    case 'saw':
      return fract(phase + 0.5) * 2 - 1
    case 'sine':
    default:
      return Math.sin(phase * Math.PI * 2)
  }
}

function evaluateRandomValue(slotSeed: number, stepIndex: number) {
  return hashUnit(slotSeed + stepIndex * 0.61803398875) * 2 - 1
}

function evaluateWaveValue(lfo: LfoConfig, elapsedTime: number, sceneKey: string) {
  const rateHz = resolveVisualRateHz(lfo.ratio)
  const slotSeed = hashString(`${sceneKey}:${lfo.id}`)

  if (lfo.wave === 'random') {
    const stepIndex = Math.floor(elapsedTime * rateHz)
    return evaluateRandomValue(slotSeed, stepIndex)
  }

  return evaluateBaseWave(lfo.wave, fract(elapsedTime * rateHz))
}

function resolveModulatedValue(baseValue: number, range: NumericRange, amountPct: number, waveValue: number) {
  const normalizedBase = inverseLerp(range.min, range.max, baseValue)
  const depth = clamp(amountPct, 0, 100) / 100
  const reflectedNormalizedValue = reflectUnit(normalizedBase + waveValue * depth)

  return range.min + reflectedNormalizedValue * (range.max - range.min)
}

function applyCurveModulation(
  curve: CurveDefinition,
  values: Partial<Record<LfoCurveKey, number>>,
) {
  const keys = Object.keys(values) as LfoCurveKey[]

  if (keys.length === 0) {
    return curve
  }

  const resolvedCurve: CurveDefinition = { ...curve }

  keys.forEach((key) => {
    const range = CURVE_PARAMETER_RANGES[key]
    resolvedCurve[key] = clamp(values[key] ?? curve[key], range.min, range.max)
  })

  return resolvedCurve
}

function applyParticleModulation(
  particles: ParticleTuning,
  values: Partial<Record<LfoParticleKey, number>>,
) {
  const keys = Object.keys(values) as LfoParticleKey[]

  if (keys.length === 0) {
    return particles
  }

  const resolvedParticles: ParticleTuning = { ...particles }

  keys.forEach((key) => {
    const range = PARTICLE_PARAMETER_RANGES[key]
    resolvedParticles[key] = clamp(values[key] ?? particles[key], range.min, range.max)
  })

  return resolvedParticles
}

export function resolveLfoSceneParameters({
  sceneKey,
  curve,
  particles,
  lfos,
  elapsedTime,
  reducedMotion,
}: ResolveLfoSceneParametersOptions): ResolvedLfoSceneParameters {
  if (reducedMotion) {
    return { curve, particles }
  }

  const curveValues: Partial<Record<LfoCurveKey, number>> = {}
  const particleValues: Partial<Record<LfoParticleKey, number>> = {}

  lfos.forEach((lfo) => {
    if (!lfo.enabled || lfo.amountPct <= 0) {
      return
    }

    const waveValue = evaluateWaveValue(lfo, elapsedTime, sceneKey)

    if (lfo.target.scope === 'curve') {
      const range = CURVE_PARAMETER_RANGES[lfo.target.key]
      curveValues[lfo.target.key] = resolveModulatedValue(
        curve[lfo.target.key],
        range,
        lfo.amountPct,
        waveValue,
      )
      return
    }

    const range = PARTICLE_PARAMETER_RANGES[lfo.target.key]
    particleValues[lfo.target.key] = resolveModulatedValue(
      particles[lfo.target.key],
      range,
      lfo.amountPct,
      waveValue,
    )
  })

  return {
    curve: applyCurveModulation(curve, curveValues),
    particles: applyParticleModulation(particles, particleValues),
  }
}
