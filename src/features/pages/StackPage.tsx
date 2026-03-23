import { useEffect, useRef } from 'react'
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
  const setStackView = useAppStore((state) => state.setStackView)
  const resetStackView = useAppStore((state) => state.resetStackView)

  useEffect(() => {
    resetStackView()
  }, [resetStackView])

  useEffect(() => {
    const element = interactionRef.current

    if (!element) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const currentView = useAppStore.getState().stackView
      const zoomSensitivity = currentView.zoom > 0.82 ? 0.00145 : 0.0012

      setStackView({
        zoom: clamp(
          currentView.zoom - event.deltaY * zoomSensitivity,
          0.04,
          1,
        ),
      })
    }

    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [setStackView])

  return (
    <section className={styles.page}>
      <div className={styles.pageTitleWrap}>
        <span className={styles.pageTitleLine} aria-hidden="true" />
        <h2 className={styles.pageTitle}>stack</h2>
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

          const currentView = useAppStore.getState().stackView
          const panSensitivity = 0.0068 + currentView.zoom * 0.0038
          setStackView({
            panX: clamp(currentView.panX + deltaX * panSensitivity, -1.12, 1.12),
            panY: clamp(currentView.panY - deltaY * panSensitivity, -0.92, 0.92),
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
