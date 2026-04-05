import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  STACK_ZOOM_MIN,
  STACK_ZOOM_STEP,
  getDefaultStackZoom,
  getStackZoomMax,
} from '@/shared/utils/stackZoom'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('stackZoom', () => {
  it('keeps desktop and tablet at the existing max zoom-out step', () => {
    vi.stubGlobal('window', { innerWidth: 768 })
    expect(getStackZoomMax()).toBe(1)

    vi.stubGlobal('window', { innerWidth: 1440 })
    expect(getStackZoomMax()).toBe(1)
  })

  it('adds one extra zoom-out step on mobile viewports', () => {
    vi.stubGlobal('window', { innerWidth: 390 })
    expect(getStackZoomMax()).toBe(1 + STACK_ZOOM_STEP)
    expect(getDefaultStackZoom()).toBe(1 + STACK_ZOOM_STEP)
  })

  it('preserves the existing zoom-in floor', () => {
    expect(STACK_ZOOM_MIN).toBe(0.4)
  })
})
