import type { CurveDefinition, ParticleTuning } from '@/shared/types'

type CurveSceneConfig = {
  curve: CurveDefinition
  particles: ParticleTuning
}

const sharedParticles: ParticleTuning = {
  count: 4500,
  sizePx: 3.5,
  opacity: 0.75,
  strokeWeightPx: 1,
  jitterPx: 10,
  haloPx: 10,
  pointerRadiusPx: 60,
  pointerStrength: 0.16,
  driftMotion: 0,
  orbitMotion: 0.02,
  recovery: 0.008,
}

export const alphaConfig: CurveSceneConfig = {
  curve: {
    freqX: 1,
    freqY: 2,
    ampX: 0.5,
    ampY: 0.5,
    phase: 0,
    crossModAmount: 0,
    foldAmount: 0,
    ringModFreq: 0,
    speed: 0.005,
    animate: true,
  },
  particles: sharedParticles,
}

export const betaConfig: CurveSceneConfig = {
  curve: {
    freqX: 1,
    freqY: 2,
    ampX: 0.5,
    ampY: 0.7,
    phase: 0,
    crossModAmount: Math.PI * 0.72,
    foldAmount: 0.45,
    ringModFreq: 0,
    speed: 0.01,
    animate: true,
  },
  particles: sharedParticles,
}

export const gammaConfig: CurveSceneConfig = {
  curve: {
    freqX: 4,
    freqY: 4,
    ampX: 0.6,
    ampY: 0.6,
    phase: 0,
    crossModAmount: Math.PI * 0.75,
    foldAmount: 0,
    ringModFreq: 7.4,
    speed: 0.006,
    animate: true,
  },
  particles: sharedParticles,
}

export const deltaConfig: CurveSceneConfig = {
  curve: {
    freqX: 1,
    freqY: 2,
    ampX: 0.5,
    ampY: 0.7,
    phase: 0,
    crossModAmount: Math.PI * 0.72,
    foldAmount: 2.6,
    ringModFreq: 0,
    speed: 0.005,
    animate: true,
  },
  particles: sharedParticles,
}

export const frameGridConfig = {
  cellPx: 16,
  count: 3200,
  sizePx: 3.5,
  opacity: 0.75,
  haloPx: 8,
  pointerRadiusPx: 60,
  pointerStrength: 0.12,
  recovery: 0.012,
}

export const nebulaConfig: ParticleTuning = {
  ...sharedParticles,
  count: 5200,
  driftMotion: 0.01,
  orbitMotion: 0.008,
  recovery: 0.01,
}

export const menuGridConfig = {
  cellPx: 24,
  count: 3600,
  sizePx: 3.5,
  opacity: 0.75,
  haloPx: 8,
  pointerRadiusPx: 60,
  pointerStrength: 0.12,
  recovery: 0.012,
}
