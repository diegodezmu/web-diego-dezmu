import { describe, expect, it } from 'vitest'
import type { DeviceTier, SceneMode } from '@/shared/types'
import { getPresetForTier, sectionToSceneMode } from '@/config/scenePresets'

const sceneModes: SceneMode[] = [
  'homeAlpha',
  'aboutBeta',
  'aboutFrame',
  'stackGamma',
  'stackEmbeddingMap',
  'contactDelta',
  'contactDeltaOut',
  'menuGrid',
]

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

describe('sectionToSceneMode', () => {
  it('maps each section to the expected scene mode', () => {
    expect(sectionToSceneMode('home')).toBe('homeAlpha')
    expect(sectionToSceneMode('about')).toBe('aboutBeta')
    expect(sectionToSceneMode('stack')).toBe('stackGamma')
    expect(sectionToSceneMode('contact')).toBe('contactDelta')
  })
})

describe('getPresetForTier', () => {
  it('is deterministic for every scene mode and tier', () => {
    const tiers: DeviceTier[] = ['desktop', 'tablet', 'mobile', 'lowPower']

    for (const mode of sceneModes) {
      for (const tier of tiers) {
        expect(getPresetForTier(mode, tier)).toEqual(getPresetForTier(mode, tier))
      }
    }
  })

  it('scales sizePx and preserves invariant fields across tiers', () => {
    for (const mode of sceneModes) {
      const desktopPreset = getPresetForTier(mode, 'desktop')
      const tabletPreset = getPresetForTier(mode, 'tablet')

      expect(tabletPreset.count).toBe(Math.max(1800, Math.floor(desktopPreset.count * tierCountScale.tablet)))
      expect(tabletPreset.sizePx).toBe(desktopPreset.sizePx * tierSizeScale.tablet)
      expect(tabletPreset.opacity).toBe(desktopPreset.opacity)
      expect(tabletPreset.cameraPosition).toEqual(desktopPreset.cameraPosition)
      expect(tabletPreset.cameraLookAt).toEqual(desktopPreset.cameraLookAt)
      expect(tabletPreset.spread).toEqual(desktopPreset.spread)
    }
  })

  it('enforces the minimum particle count floor for lowPower', () => {
    for (const mode of sceneModes) {
      const desktopPreset = getPresetForTier(mode, 'desktop')
      const lowPowerPreset = getPresetForTier(mode, 'lowPower')

      expect(lowPowerPreset.count).toBe(
        Math.max(1800, Math.floor(desktopPreset.count * tierCountScale.lowPower)),
      )
    }
  })
})
