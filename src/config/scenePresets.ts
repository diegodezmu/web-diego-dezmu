import { particleDefaults } from '@/config/curves'
import type { AppSection, DeviceTier, SceneMode, ScenePreset } from '@/shared/types'

export const scenePresets: Record<SceneMode, ScenePreset> = {
  logo: {
    count: 14_000,
    size: 0.072,
    opacity: 0.7,
    jitter: 0.015,
    orbit: 0.012,
    drift: 0,
    recovery: 0.085,
    pointerRadiusPx: 60,
    pointerStrength: 0.18,
    cameraPosition: [0, 0, 11.5],
    cameraLookAt: [0, 0, 0],
    spread: [9.8, 2.2, 0.6],
  },
  aboutCurve: {
    count: particleDefaults.count,
    size: 0.052,
    opacity: 0.7,
    jitter: 0.03,
    orbit: 0.038,
    drift: 0,
    recovery: 0.052,
    pointerRadiusPx: 60,
    pointerStrength: 0.26,
    cameraPosition: [0, -0.08, 10.4],
    cameraLookAt: [0, 0, 0],
    spread: [6.8, 5.6, 1.3],
  },
  aboutFrame: {
    count: particleDefaults.count,
    size: 0.048,
    opacity: 0.7,
    jitter: 0.016,
    orbit: 0.014,
    drift: 0,
    recovery: 0.06,
    pointerRadiusPx: 60,
    pointerStrength: 0.22,
    cameraPosition: [0, 0, 10.7],
    cameraLookAt: [0, 0, 0],
    spread: [10.8, 6.3, 0.8],
  },
  stackCloud: {
    count: 16_000,
    size: 0.046,
    opacity: 0.7,
    jitter: 0.026,
    orbit: 0.022,
    drift: 0.016,
    recovery: 0.048,
    pointerRadiusPx: 60,
    pointerStrength: 0.12,
    cameraPosition: [0, 0.08, 12.5],
    cameraLookAt: [0, 0, 0],
    spread: [14, 7.8, 5.8],
  },
  contactCurve: {
    count: particleDefaults.count,
    size: 0.052,
    opacity: 0.7,
    jitter: 0.03,
    orbit: 0.034,
    drift: 0,
    recovery: 0.052,
    pointerRadiusPx: 60,
    pointerStrength: 0.24,
    cameraPosition: [0, 0, 10.2],
    cameraLookAt: [0, 0, 0],
    spread: [6.6, 5.4, 1.6],
  },
  menuFlood: {
    count: 12_000,
    size: 0.048,
    opacity: 0.6,
    jitter: 0.018,
    orbit: 0.014,
    drift: 0,
    recovery: 0.048,
    pointerRadiusPx: 240,
    pointerStrength: 0.24,
    cameraPosition: [0, 0, 9.6],
    cameraLookAt: [0, 0, 0],
    spread: [11.8, 7.2, 1],
  },
}

const tierCountScale: Record<DeviceTier, number> = {
  desktop: 1,
  tablet: 0.84,
  mobile: 0.66,
  lowPower: 0.54,
}

export function getPresetForTier(mode: SceneMode, tier: DeviceTier): ScenePreset {
  const preset = scenePresets[mode]
  const scale = tierCountScale[tier]

  return {
    ...preset,
    count: Math.max(2400, Math.floor(preset.count * scale)),
    size:
      tier === 'desktop'
        ? preset.size
        : tier === 'tablet'
          ? preset.size * 0.94
          : preset.size * 0.88,
  }
}

export function sectionToSceneMode(section: AppSection): SceneMode {
  switch (section) {
    case 'about':
      return 'aboutCurve'
    case 'stack':
      return 'stackCloud'
    case 'contact':
      return 'contactCurve'
    case 'home':
    default:
      return 'logo'
  }
}
