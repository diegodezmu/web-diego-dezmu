import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectCapabilities, getDeviceTier } from '@/shared/utils/device'

type BrowserStubOptions = {
  width: number
  coarsePointer?: boolean
  reducedMotion?: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
}

function stubBrowserEnvironment({
  width,
  coarsePointer = false,
  reducedMotion = false,
  deviceMemory = 8,
  hardwareConcurrency = 8,
}: BrowserStubOptions) {
  vi.stubGlobal('window', {
    innerWidth: width,
    matchMedia: (query: string) => ({
      matches:
        query === '(pointer: coarse)'
          ? coarsePointer
          : query === '(prefers-reduced-motion: reduce)'
            ? reducedMotion
            : false,
    }),
  })

  vi.stubGlobal('navigator', {
    deviceMemory,
    hardwareConcurrency,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getDeviceTier', () => {
  it('uses 767px as the mobile cutoff', () => {
    expect(getDeviceTier(767)).toBe('mobile')
    expect(getDeviceTier(768)).toBe('tablet')
  })

  it('uses 1200px as the tablet cutoff', () => {
    expect(getDeviceTier(1200)).toBe('tablet')
    expect(getDeviceTier(1201)).toBe('desktop')
  })
})

describe('detectCapabilities', () => {
  it('detects a normal desktop environment', () => {
    stubBrowserEnvironment({ width: 1440 })

    expect(detectCapabilities()).toEqual({
      deviceTier: 'desktop',
      reducedMotion: false,
      isTouch: false,
    })
  })

  it('marks small viewports as lowPower even when getDeviceTier would be mobile', () => {
    stubBrowserEnvironment({ width: 767, coarsePointer: true })

    expect(detectCapabilities()).toEqual({
      deviceTier: 'lowPower',
      reducedMotion: false,
      isTouch: true,
    })
  })

  it('marks reduced-motion environments as lowPower', () => {
    stubBrowserEnvironment({ width: 1440, reducedMotion: true })

    expect(detectCapabilities()).toEqual({
      deviceTier: 'lowPower',
      reducedMotion: true,
      isTouch: false,
    })
  })

  it('marks low-memory and low-concurrency devices as lowPower', () => {
    stubBrowserEnvironment({ width: 1440, deviceMemory: 4, hardwareConcurrency: 4 })

    expect(detectCapabilities()).toEqual({
      deviceTier: 'lowPower',
      reducedMotion: false,
      isTouch: false,
    })
  })
})
