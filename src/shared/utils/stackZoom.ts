const MOBILE_STACK_ZOOM_BREAKPOINT = 767

export const STACK_ZOOM_MIN = 0.4
export const STACK_ZOOM_STEP = 0.2

const STACK_ZOOM_MAX_DESKTOP = 1.0
const STACK_ZOOM_MAX_MOBILE = STACK_ZOOM_MAX_DESKTOP + STACK_ZOOM_STEP

function getStackZoomMaxForWidth(width: number) {
  return width <= MOBILE_STACK_ZOOM_BREAKPOINT ? STACK_ZOOM_MAX_MOBILE : STACK_ZOOM_MAX_DESKTOP
}

function getDefaultStackZoomForWidth(width: number) {
  return getStackZoomMaxForWidth(width)
}

export function getStackZoomMax() {
  return typeof window !== 'undefined' ? getStackZoomMaxForWidth(window.innerWidth) : STACK_ZOOM_MAX_DESKTOP
}

export function getDefaultStackZoom() {
  return typeof window !== 'undefined'
    ? getDefaultStackZoomForWidth(window.innerWidth)
    : STACK_ZOOM_MAX_DESKTOP
}
