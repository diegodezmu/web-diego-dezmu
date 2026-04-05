import { describe, expect, it } from 'vitest'
import {
  STACK_ZOOM_MIN,
  STACK_ZOOM_STEP,
  getDefaultStackZoomForWidth,
  getStackZoomMaxForWidth,
} from '@/shared/utils/stackZoom'

describe('stackZoom', () => {
  it('keeps desktop and tablet at the existing max zoom-out step', () => {
    expect(getStackZoomMaxForWidth(768)).toBe(1)
    expect(getStackZoomMaxForWidth(1440)).toBe(1)
  })

  it('adds one extra zoom-out step on mobile viewports', () => {
    expect(getStackZoomMaxForWidth(767)).toBe(1 + STACK_ZOOM_STEP)
    expect(getDefaultStackZoomForWidth(390)).toBe(1 + STACK_ZOOM_STEP)
  })

  it('preserves the existing zoom-in floor', () => {
    expect(STACK_ZOOM_MIN).toBe(0.4)
  })
})
