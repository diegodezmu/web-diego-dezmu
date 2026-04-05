import type { Capabilities, DeviceTier } from '@/shared/types'

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number
}

function getDeviceTier(width: number): DeviceTier {
  if (width <= 767) {
    return 'mobile'
  }

  if (width <= 1200) {
    return 'tablet'
  }

  return 'desktop'
}

export function detectCapabilities(): Omit<Capabilities, 'webglSupported'> {
  const width = window.innerWidth
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const deviceMemory = (navigator as NavigatorWithDeviceMemory).deviceMemory ?? 8
  const concurrency = navigator.hardwareConcurrency ?? 8
  const lowPower =
    width <= 767 || deviceMemory <= 4 || concurrency <= 4 || reducedMotion

  return {
    deviceTier: lowPower ? 'lowPower' : getDeviceTier(width),
    reducedMotion,
    isTouch: coarsePointer,
  }
}
