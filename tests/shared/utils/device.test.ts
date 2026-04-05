import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectCapabilities } from '@/shared/utils/device'

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

describe('detectCapabilities', () => {
  it('keeps non-low-power widths on the tablet and desktop tiers', () => {
    stubBrowserEnvironment({ width: 768 })
    expect(detectCapabilities().deviceTier).toBe('tablet')

    stubBrowserEnvironment({ width: 1200 })
    expect(detectCapabilities().deviceTier).toBe('tablet')

    stubBrowserEnvironment({ width: 1201 })
    expect(detectCapabilities().deviceTier).toBe('desktop')
  })

  it('detects a normal desktop environment', () => {
    stubBrowserEnvironment({ width: 1440 })

    expect(detectCapabilities()).toEqual({
      deviceTier: 'desktop',
      reducedMotion: false,
      isTouch: false,
    })
  })

  it('marks small viewports as lowPower', () => {
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
