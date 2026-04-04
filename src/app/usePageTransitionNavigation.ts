import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/state/appStore'

function isModifiedEvent(event: {
  button: number
  metaKey: boolean
  altKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
}) {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

export function shouldInterceptPageTransitionClick(event: {
  button: number
  metaKey: boolean
  altKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
}) {
  return !isModifiedEvent(event)
}

export function usePageTransitionNavigation() {
  const location = useLocation()
  const queuePageTransition = useAppStore((state) => state.queuePageTransition)
  const startPageTransitionExit = useAppStore((state) => state.startPageTransitionExit)

  return useCallback(
    (targetPath: string) => {
      const currentState = useAppStore.getState()

      if (
        currentState.pageTransitionPhase === 'exiting' ||
        targetPath === location.pathname ||
        targetPath === currentState.pageTransitionTarget
      ) {
        return
      }

      queuePageTransition(targetPath, location.pathname)

      if (!currentState.menuOverlayActive) {
        startPageTransitionExit()
      }
    },
    [location.pathname, queuePageTransition, startPageTransitionExit],
  )
}
