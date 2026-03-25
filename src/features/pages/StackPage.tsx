import { useEffect, useRef } from 'react'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { useAppStore } from '@/state/appStore'
import styles from './StackPage.module.css'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function StackPage() {
  const pointerState = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  })
  const interactionRef = useRef<HTMLDivElement | null>(null)
  const stackProgress = useAppStore((state) => state.stackProgress)
  const isTouch = useAppStore((state) => state.capabilities.isTouch)
  const setSceneMode = useAppStore((state) => state.setSceneMode)
  const setStackView = useAppStore((state) => state.setStackView)
  const resetStackView = useAppStore((state) => state.resetStackView)
  const setStackProgress = useAppStore((state) => state.setStackProgress)

  useEffect(() => {
    resetStackView()
    setStackProgress(0)
    setSceneMode('stackBridge')
  }, [resetStackView, setSceneMode, setStackProgress])

  useEffect(() => {
    setSceneMode(stackProgress > 0.22 ? 'stackEmbeddings' : 'stackBridge')
  }, [setSceneMode, stackProgress])

  useEffect(() => {
    const element = interactionRef.current
    if (!element) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const current = useAppStore.getState().stackProgress
      setStackProgress(clamp(current + event.deltaY * 0.0022, 0, 1))
    }

    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [setStackProgress])

  const titleShiftClass = stackProgress > 0.18 ? styles.titleTop : styles.titleCenter

  return (
    <section className={styles.page}>
      <div className={`${styles.titleAnchor} ${titleShiftClass}`}>
        <PageTitle title={siteContent.stackTitle} />
      </div>

      <div
        ref={interactionRef}
        className={styles.interactionLayer}
        data-cursor="interactive"
        onPointerDown={(event) => {
          pointerState.current = {
            active: true,
            x: event.clientX,
            y: event.clientY,
          }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!pointerState.current.active) {
            return
          }

          const deltaX = event.clientX - pointerState.current.x
          const deltaY = event.clientY - pointerState.current.y
          pointerState.current = {
            active: true,
            x: event.clientX,
            y: event.clientY,
          }

          if (isTouch) {
            const currentProgress = useAppStore.getState().stackProgress
            setStackProgress(clamp(currentProgress + deltaY * -0.008, 0, 1))
            return
          }

          const currentView = useAppStore.getState().stackView
          setStackView({
            panX: clamp(currentView.panX + deltaX * 0.005, -1.24, 1.24),
            panY: clamp(currentView.panY - deltaY * 0.005, -0.94, 0.94),
          })
        }}
        onPointerUp={(event) => {
          pointerState.current.active = false
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerLeave={() => {
          pointerState.current.active = false
        }}
      />
    </section>
  )
}
