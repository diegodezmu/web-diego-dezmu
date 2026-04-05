import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { getDefaultStackZoom } from '@/shared/utils/stackZoom'
import { useAppStore } from '@/state/appStore'

const STACK_TRANSITION_DURATION_S = 2

export function useStackTransition(stackProgress: number) {
  const stackStateTarget = useAppStore((state) => state.stackStateTarget)
  const setSceneMode = useAppStore((state) => state.setSceneMode)
  const setStackProgress = useAppStore((state) => state.setStackProgress)
  const setStackCamera = useAppStore((state) => state.setStackCamera)
  const setStackZoom = useAppStore((state) => state.setStackZoom)
  const reducedMotion = useAppStore((state) => state.capabilities.reducedMotion)
  const stackProgressTweenRef = useRef<gsap.core.Tween | null>(null)
  const stackProgressValueRef = useRef({ value: 0 })

  useEffect(() => {
    stackProgressValueRef.current.value = stackProgress
  }, [stackProgress])

  useEffect(() => {
    const nextMode = stackProgress > 0.001 ? 'stackEmbeddingMap' : 'stackGamma'

    if (useAppStore.getState().sceneMode !== nextMode) {
      setSceneMode(nextMode)
    }
  }, [setSceneMode, stackProgress])

  useEffect(() => {
    const current = useAppStore.getState().stackProgress

    if (Math.abs(current - stackStateTarget) < 0.0001) {
      return
    }

    setStackZoom(getDefaultStackZoom())

    if (stackStateTarget === 1) {
      setStackCamera({ hasInteracted: false })
    }

    stackProgressTweenRef.current?.kill()

    if (reducedMotion) {
      setStackProgress(stackStateTarget)
      return
    }

    stackProgressValueRef.current.value = current
    stackProgressTweenRef.current = gsap.to(stackProgressValueRef.current, {
      value: stackStateTarget,
      duration: STACK_TRANSITION_DURATION_S,
      ease: 'power2.inOut',
      overwrite: true,
      onUpdate: () => {
        setStackProgress(stackProgressValueRef.current.value)
      },
    })

    return () => {
      stackProgressTweenRef.current?.kill()
      stackProgressTweenRef.current = null
    }
  }, [reducedMotion, setStackCamera, setStackProgress, setStackZoom, stackStateTarget])

  useEffect(
    () => () => {
      stackProgressTweenRef.current?.kill()
    },
    [],
  )

  const revealProgress = stackProgress

  return {
    revealProgress,
    titleOpacity: 1 - Math.min(1, revealProgress * 1.24),
    titleShift: revealProgress * 16,
  }
}
