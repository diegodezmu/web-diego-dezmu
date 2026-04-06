import type { CurveDefinition, LfoBank, LfoConfig, LfoSlotId, ParticleTuning } from '@/shared/types'

export type CurveSceneConfig = {
  curve: CurveDefinition
  particles: ParticleTuning
  lfos: LfoBank
  viewportScale: {
    width: number
    height: number
  }
}

type ParticleSpec = {
  count: number
  sizePx: number
  opacityPct: number
  glowBoostPct: number
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
    glowBoost: spec.glowBoostPct / 100,
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

function createInactiveLfo(id: LfoSlotId): LfoConfig {
  return {
    id,
    enabled: false,
    ratio: 0,
    wave: 'sine',
    amountPct: 0,
    target: {
      scope: 'curve',
      key: 'phase',
    },
  }
}

function createLfoBank(firstLfo?: Partial<LfoConfig>): LfoBank {
  const lfo1: LfoConfig = {
    ...createInactiveLfo('lfo1'),
    ...firstLfo,
    id: 'lfo1',
    target: firstLfo?.target ?? createInactiveLfo('lfo1').target,
  }

  return [lfo1, createInactiveLfo('lfo2'), createInactiveLfo('lfo3')]
}

const sharedCurveParticles = createParticleTuning({
  count: 15000,
  sizePx: 3.3,
  opacityPct: 90,
  glowBoostPct: 100,
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
    freqX: 2,
    freqY: 1,
    ampX: 0.5,
    ampY: 0.3,
    phase: 0,
    crossModAmount: 0,
    foldAmount: 0,
    ringModFreq: 0,
    speed: 0.022,
    animate: true,
  },
  particles: sharedCurveParticles,
  lfos: createLfoBank({
    enabled: true,
    ratio: 0.03,
    wave: 'sine',
    amountPct: 5,
    target: {
      scope: 'curve',
      key: 'ampX',
    },
  }),
  viewportScale: {
    width: 0.18,
    height: 0.18,
  },
}

export const betaConfig: CurveSceneConfig = {
  curve: {
    freqX: 1,
    freqY: 1,
    ampX: 0.5,
    ampY: 0.55,
    phase: 0,
    crossModAmount: Math.PI * 0.25,
    foldAmount: 0,
    ringModFreq: 0,
    speed: 0.012,
    animate: true,
  },
  particles: sharedCurveParticles,
  lfos: createLfoBank({
    enabled: false,
    ratio: 0.1,
    wave: 'sawtooth',
    amountPct: 10,
    target: {
      scope: 'curve',
      key: 'crossModAmount',
    },
  }),
  viewportScale: {
    width: 0.20,
    height: 0.20,
  },
}

export const gammaConfig: CurveSceneConfig = {
  curve: {
    freqX: 2,
    freqY: 6,
    ampX: 0.38,
    ampY: 0.5,
    phase: 0,
    crossModAmount: Math.PI * 1.5,
    foldAmount: 0,
    ringModFreq: 0,
    speed: 0.005,
    animate: true,
  },
  particles: sharedCurveParticles,
  lfos: createLfoBank({
    enabled: true,
    ratio: 0.25,
    wave: 'triangle',
    amountPct: 10,
    target: {
      scope: 'curve',
      key: 'ampY',
    },
  }),
  viewportScale: {
    width: 0.3,
    height: 0.26,
  },
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
    count: 15000,
    sizePx: 3.5,
    opacityPct: 90,
    glowBoostPct: 100,
    strokeWeightPx: 1,
    jitterPx: 10,
    haloPx: 12,
    pointerRadiusPx: 60,
    pointerStrength: 10,
    driftMotionPct: 0,
    orbitMotionPct: 20,
    recovery: 0.008,
  }),
  lfos: createLfoBank({
    enabled: true,
    ratio: 0.04,
    wave: 'sine',
    amountPct: 0.1,
    target: {
      scope: 'curve',
      key: 'crossModAmount',
    },
  }),
  viewportScale: {
    width: 0.26,
    height: 0.26,
  },
}

export const aboutMarginGridConfig = {
  cellPx: 18,
  count: 15000,
  sizePx: 1.52,
  opacity: 90,
  glowBoost: 100,
  haloPx: 12,
  pointerRadiusPx: 60,
  pointerStrength: 0.1,
  recovery: 0.012,
}

export const stackEmbeddingMapConfig: ParticleTuning = {
  count: 15000,
  sizePx: 3.4,
  opacity: 0.9,
  glowBoost: 100,
  strokeWeightPx: 1,
  jitterPx: 0,
  haloPx: 10,
  pointerRadiusPx: 0,
  pointerStrength: 0,
  driftMotion: 50,
  orbitMotion: 50,
  recovery: 0.020,
}

export const menuGridConfig = {
  cellPx: 18,
  count: 15000,
  sizePx: 3.1,
  opacity: 90,
  glowBoost: 100,
  haloPx: 12,
  pointerRadiusPx: 192,
  pointerStrength: 0.1,
  recovery: 0.008,
}
