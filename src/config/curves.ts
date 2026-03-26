import type { CurveDefinition, ParticleTuning } from '@/shared/types'

type CurveSceneConfig = {
  curve: CurveDefinition
  particles: ParticleTuning
}

type ParticleSpec = {
  count: number
  sizePx: number
  opacityPct: number
  strokeWeightPx: number
  jitterPx: number
  haloPx: number
  pointerRadiusPx: number
  pointerStrength: number
  driftMotionPct: number
  orbitMotionPct: number
  recovery: number
}

function createParticleTuning(spec: ParticleSpec): ParticleTuning {
  return {
    count: spec.count,
    sizePx: spec.sizePx,
    opacity: spec.opacityPct / 100,
    strokeWeightPx: spec.strokeWeightPx,
    jitterPx: spec.jitterPx,
    haloPx: spec.haloPx,
    pointerRadiusPx: spec.pointerRadiusPx,
    pointerStrength: spec.pointerStrength * 0.016,
    driftMotion: spec.driftMotionPct / 1000,
    orbitMotion: spec.orbitMotionPct / 1000,
    recovery: spec.recovery,
  }
}

const sharedCurveParticles = createParticleTuning({
  count: 4500,
  sizePx: 3.3,
  opacityPct: 60,
  strokeWeightPx: 1,
  jitterPx: 10,
  haloPx: 12,
  pointerRadiusPx: 60,
  pointerStrength: 10,
  driftMotionPct: 0,
  orbitMotionPct: 20,
  recovery: 0.008,
})

export const alphaConfig: CurveSceneConfig = {
  curve: {
    freqX: 1,
    freqY: 2,
    ampX: 0.4,
    ampY: 0.4,
    phase: 0,
    crossModAmount: 0,
    foldAmount: 0,
    ringModFreq: 0,
    speed: 0.005,
    animate: true,
  },
  particles: sharedCurveParticles,
}

export const betaConfig: CurveSceneConfig = {
  curve: {
    freqX: 1,
    freqY: 1,
    ampX: 0.5,
    ampY: 0.55,
    phase: 0,
    crossModAmount: Math.PI * 0.25,
    foldAmount: 5,
    ringModFreq: 0,
    speed: 0.004,
    animate: true,
  },
  particles: sharedCurveParticles,
}

export const deltaConfig: CurveSceneConfig = {
  curve: {
    freqX: 1,
    freqY: 2,
    ampX: 0.45,
    ampY: 0.6,
    phase: 0,
    crossModAmount: Math.PI * 0.7,
    foldAmount: 2.7,
    ringModFreq: 0,
    speed: 0.02,
    animate: true,
  },
  particles: createParticleTuning({
    count: 4500,
    sizePx: 3.5,
    opacityPct: 75,
    strokeWeightPx: 1,
    jitterPx: 10,
    haloPx: 10,
    pointerRadiusPx: 60,
    pointerStrength: 10,
    driftMotionPct: 0,
    orbitMotionPct: 20,
    recovery: 0.008,
  }),
}

export const frameGridConfig = {
  cellPx: 18,
  count: 3600,
  sizePx: 3.3,
  opacity: 0.54,
  haloPx: 10,
  pointerRadiusPx: 60,
  pointerStrength: 0.14,
  recovery: 0.012,
}

export const aboutMarginGridConfig = {
  cellPx: 18,
  count: 4200,
  sizePx: 3.1,
  opacity: 0.48,
  haloPx: 6,
  pointerRadiusPx: 60,
  pointerStrength: 0.1,
  recovery: 0.012,
}

export const stackEmbeddingMapConfig: ParticleTuning = {
  count: 5600,
  sizePx: 3.2,
  opacity: 0.78,
  strokeWeightPx: 1,
  jitterPx: 0,
  haloPx: 9,
  pointerRadiusPx: 0,
  pointerStrength: 0,
  driftMotion: 0,
  orbitMotion: 0,
  recovery: 0.018,
}

export const menuGridConfig = {
  cellPx: 18,
  count: 4200,
  sizePx: 3.1,
  opacity: 0.48,
  haloPx: 6,
  pointerRadiusPx: 192,
  pointerStrength: 0.1,
  recovery: 0.008,
}
