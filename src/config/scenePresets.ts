import {
  alphaConfig,
  betaConfig,
  deltaConfig,
  frameGridConfig,
  menuGridConfig,
  stackBridgeConfig,
  stackEmbeddingsConfig,
} from '@/config/curves'
import type { AppSection, DeviceTier, SceneMode, ScenePreset } from '@/shared/types'

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
    count: frameGridConfig.count,
    sizePx: frameGridConfig.sizePx,
    opacity: frameGridConfig.opacity,
    strokeWeightPx: 1,
    jitterPx: 0,
    haloPx: frameGridConfig.haloPx,
    pointerRadiusPx: frameGridConfig.pointerRadiusPx,
    pointerStrength: frameGridConfig.pointerStrength,
    driftMotion: 0,
    orbitMotion: 0,
    recovery: frameGridConfig.recovery,
    spin: 0,
    cameraPosition: [0, 0, 11.2],
    cameraLookAt: [0, 0, 0],
    spread: [10.2, 6.1, 0.5],
  },
  stackBridge: {
    ...stackBridgeConfig,
    spin: 0,
    cameraPosition: [0, 0.05, 13.2],
    cameraLookAt: [0, 0, 0],
    spread: [7.6, 4.8, 3.2],
  },
  stackEmbeddings: {
    ...stackEmbeddingsConfig,
    spin: 0,
    cameraPosition: [0, 0.04, 13.9],
    cameraLookAt: [0, 0, 0],
    spread: [9.8, 5.2, 5.6],
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
      return 'stackBridge'
    case 'contact':
      return 'contactDelta'
    case 'home':
    default:
      return 'homeAlpha'
  }
}
