import {
  alphaConfig,
  aboutMarginGridConfig,
  betaConfig,
  deltaConfig,
  gammaConfig,
  menuGridConfig,
  stackEmbeddingMapConfig,
} from '@/config/curves'
import type { AppSection, DeviceTier, SceneMode, ScenePreset } from '@/shared/types'

export const EXPLODE_PRESETS: Record<
  string,
  {
    strength: number
    introStrength?: number
  }
> = {
  home: { strength: 0, introStrength: 6.5 },
  about: { strength: 0 },
  stack: { strength: 0 },
  contact: { strength: 0 },
}

export const scenePresets: Record<SceneMode, ScenePreset> = {
  homeAlpha: {
    ...alphaConfig.particles,
    spin: 0,
    cameraPosition: [0, 0, 11.3],
    cameraLookAt: [0, 0, 0],
    spread: [6.8, 3.8, 1.6],
  },
  aboutBeta: {
    ...betaConfig.particles,
    spin: 0,
    cameraPosition: [0, 0, 11.15],
    cameraLookAt: [0, 0, 0],
    spread: [6.6, 4.5, 1.6],
  },
  aboutFrame: {
    count: aboutMarginGridConfig.count,
    sizePx: aboutMarginGridConfig.sizePx,
    opacity: aboutMarginGridConfig.opacity,
    glowBoost: aboutMarginGridConfig.glowBoost,
    strokeWeightPx: 1,
    jitterPx: 0,
    haloPx: aboutMarginGridConfig.haloPx,
    pointerRadiusPx: aboutMarginGridConfig.pointerRadiusPx,
    pointerStrength: aboutMarginGridConfig.pointerStrength,
    driftMotion: 0.1,
    orbitMotion: 0.1,
    recovery: aboutMarginGridConfig.recovery,
    spin: 0,
    cameraPosition: [0, 0, 11.2],
    cameraLookAt: [0, 0, 0],
    spread: [10.2, 6.1, 0.5],
  },
  stackGamma: {
    ...gammaConfig.particles,
    spin: 0,
    cameraPosition: [0, 0, 11.2],
    cameraLookAt: [0, 0, 0],
    spread: [6.6, 4.8, 1.8],
  },
  stackEmbeddingMap: {
    ...stackEmbeddingMapConfig,
    spin: 0,
    cameraPosition: [7.4, 16.8, 5.8],
    cameraLookAt: [0, 1.5, 0],
    spread: [10, 10, 10],
  },
  contactDelta: {
    ...deltaConfig.particles,
    spin: 0,
    cameraPosition: [0, 0, 11.2],
    cameraLookAt: [0, 0, 0],
    spread: [6.4, 4.8, 1.8],
  },
  contactDeltaOut: {
    ...deltaConfig.particles,
    spin: 0,
    cameraPosition: [0, 0, 11.2],
    cameraLookAt: [0, 0, 0],
    spread: [6.4, 4.8, 1.8],
  },
  menuGrid: {
    count: menuGridConfig.count,
    sizePx: menuGridConfig.sizePx,
    opacity: menuGridConfig.opacity,
    glowBoost: menuGridConfig.glowBoost,
    strokeWeightPx: 1,
    jitterPx: 0,
    haloPx: menuGridConfig.haloPx,
    pointerRadiusPx: menuGridConfig.pointerRadiusPx,
    pointerStrength: menuGridConfig.pointerStrength,
    driftMotion: 0,
    orbitMotion: 0,
    recovery: menuGridConfig.recovery,
    spin: 0,
    cameraPosition: [0, 0, 10.9],
    cameraLookAt: [0, 0, 0],
    spread: [11.6, 7.1, 0.2],
  },
}

const tierCountScale: Record<DeviceTier, number> = {
  desktop: 1,
  tablet: 0.84,
  mobile: 0.72,
  lowPower: 0.6,
}

const tierSizeScale: Record<DeviceTier, number> = {
  desktop: 1,
  tablet: 0.94,
  mobile: 0.9,
  lowPower: 0.88,
}

export function getPresetForTier(mode: SceneMode, tier: DeviceTier): ScenePreset {
  const preset = scenePresets[mode]

  return {
    ...preset,
    count: Math.max(1800, Math.floor(preset.count * tierCountScale[tier])),
    sizePx: preset.sizePx * tierSizeScale[tier],
  }
}

export function sectionToSceneMode(section: AppSection): SceneMode {
  switch (section) {
    case 'about':
      return 'aboutBeta'
    case 'stack':
      return 'stackGamma'
    case 'contact':
      return 'contactDelta'
    case 'home':
    default:
      return 'homeAlpha'
  }
}
