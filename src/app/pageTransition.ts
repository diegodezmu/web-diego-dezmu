export const PAGE_TITLE_EXIT_DURATION_S = 0.9
export const PAGE_TITLE_EXIT_DURATION_MS = PAGE_TITLE_EXIT_DURATION_S * 1000
export const PAGE_TITLE_EXIT_EASE = 'power3.in'
export const PAGE_TITLE_EXIT_DISTANCE_RATIO = 0.15
export const PAGE_TITLE_SECONDARY_EXIT_DISTANCE_RATIO = 0.1

function getViewportHeightPx() {
  if (typeof window === 'undefined') {
    return 0
  }

  return window.visualViewport?.height ?? window.innerHeight
}

export function getPageTitleExitDistancePx() {
  return Math.round(getViewportHeightPx() * PAGE_TITLE_EXIT_DISTANCE_RATIO)
}

export function getPageTitleSecondaryExitDistancePx() {
  return Math.round(getViewportHeightPx() * PAGE_TITLE_SECONDARY_EXIT_DISTANCE_RATIO)
}
