import type { CurveDefinition } from '@/shared/types'

export const alphaCurve: CurveDefinition = {
  freqX: 5,
  freqY: 1,
  ampX: 0.4,
  ampY: 0.51,
  phase: 0,
  crossModAmount: 0,
  foldAmount: 0,
  ringModFreq: 0,
  speed: 0.006,
  animate: true,
}

export const betaCurve: CurveDefinition = {
  freqX: 3,
  freqY: 2,
  ampX: 0.52,
  ampY: 0.44,
  phase: Math.PI * 0.25,
  crossModAmount: 0,
  foldAmount: 0,
  ringModFreq: 0,
  speed: 0.005,
  animate: true,
}

export const particleDefaults = {
  count: 14_000,
  size: 7,
  opacity: 0.7,
  strokeWeight: 0.5,
  jitter: 20,
  halo: 25,
  pointerRadius: 60,
  pointerStrength: 108,
  driftMotion: 0,
  orbitMotion: 0.03,
  recovery: 0.04,
  color: '#ffffff',
}
