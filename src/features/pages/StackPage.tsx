import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { useAppStore } from '@/state/appStore'
import styles from './StackPage.module.css'

const PHI_MIN = 0.1
const PHI_MAX = Math.PI - 0.1
const RADIUS_MIN = 10
const RADIUS_MAX = 35
const ORBIT_SPEED = 0.006
const DAMPING = 0.90

type TouchPointList = {
  length: number
  [index: number]: { clientX: number; clientY: number }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getTouchDistance(touches: TouchPointList) {
  if (touches.length < 2) {
    return 0
  }

  const deltaX = touches[0]!.clientX - touches[1]!.clientX
  const deltaY = touches[0]!.clientY - touches[1]!.clientY
  return Math.hypot(deltaX, deltaY)
}

export function StackPage() {
  const shellRef = useRef<HTMLElement | null>(null)
  const interactionRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    touchDistance: 0,
  })
  const velocityRef = useRef({
    theta: 0,
    phi: 0,
  })
  const inertiaFrameRef = useRef<number | null>(null)
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)
  const stackCamera = useAppStore((state) => state.stackCamera)
  const setSceneMode = useAppStore((state) => state.setSceneMode)
  const setStackCamera = useAppStore((state) => state.setStackCamera)
  const markStackCameraInteracted = useAppStore((state) => state.markStackCameraInteracted)
  const resetStackCamera = useAppStore((state) => state.resetStackCamera)

  const stopInertia = () => {
    if (inertiaFrameRef.current !== null) {
      window.cancelAnimationFrame(inertiaFrameRef.current)
      inertiaFrameRef.current = null
    }
  }

  useEffect(() => {
    setSceneMode('stackEmbeddingMap')
  }, [setSceneMode])

  useLayoutEffect(() => {
    if (contentRevealKey === 0) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [`.${styles.titleBlock}`, `.${styles.hint}`, `.${styles.resetButton}`],
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power2.out', stagger: 0.04 },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [contentRevealKey])

  useEffect(() => {
    const layer = interactionRef.current
    if (!layer) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      stopInertia()
      markStackCameraInteracted()
      const current = useAppStore.getState().stackCamera
      setStackCamera({
        radiusTarget: clamp(
          current.radiusTarget + (event.deltaY > 0 ? 0.8 : -0.8),
          RADIUS_MIN,
          RADIUS_MAX,
        ),
      })
    }

    layer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      layer.removeEventListener('wheel', handleWheel)
    }
  }, [markStackCameraInteracted, setStackCamera])

  useEffect(() => {
    stopInertia()
    velocityRef.current.theta = 0
    velocityRef.current.phi = 0
  }, [stackCamera.resetNonce])

  useEffect(() => () => stopInertia(), [])

  const startInertia = () => {
    stopInertia()

    const tick = () => {
      velocityRef.current.theta *= DAMPING
      velocityRef.current.phi *= DAMPING

      if (
        Math.abs(velocityRef.current.theta) < 0.00003 &&
        Math.abs(velocityRef.current.phi) < 0.00003
      ) {
        velocityRef.current.theta = 0
        velocityRef.current.phi = 0
        inertiaFrameRef.current = null
        return
      }

      const current = useAppStore.getState().stackCamera
      setStackCamera({
        thetaTarget: current.thetaTarget + velocityRef.current.theta,
        phiTarget: clamp(current.phiTarget + velocityRef.current.phi, PHI_MIN, PHI_MAX),
      })

      inertiaFrameRef.current = window.requestAnimationFrame(tick)
    }

    inertiaFrameRef.current = window.requestAnimationFrame(tick)
  }

  return (
    <section ref={shellRef} className={styles.page}>
      <div className={styles.titleAnchor}>
        <PageTitle className={styles.titleBlock} title={siteContent.stackTitle} />
      </div>

      <div className={styles.hint} style={{ opacity: stackCamera.hasInteracted ? 0 : 1 }}>
        Drag to orbit · Scroll to zoom
      </div>

      <button
        type="button"
        className={styles.resetButton}
        title="Reset view"
        data-cursor="interactive"
        onClick={() => {
          stopInertia()
          velocityRef.current.theta = 0
          velocityRef.current.phi = 0
          resetStackCamera()
        }}
      >
        <svg viewBox="0 -960 960 960" aria-hidden="true">
          <path d="M460-80v-183.92l-59.38 59.15-28.31-28.31L480-340.77l107.69 107.69-28.31 28.31L500-263.92V-80h-40ZM233.08-372.31l-28.31-28.31L263.92-460H80v-40h183.92l-59.15-59.38 28.31-28.31L340.77-480 233.08-372.31Zm493.84 0L619.23-480l107.69-107.69 28.31 28.31L696.08-500H880v40H696.08l59.15 59.38-28.31 28.31ZM480-440.77q-16.54 0-27.88-11.35-11.35-11.34-11.35-27.88t11.35-27.88q11.34-11.35 27.88-11.35t27.88 11.35q11.35 11.34 11.35 27.88t-11.35 27.88q-11.34 11.35-27.88 11.35Zm0-178.46L372.31-726.92l28.31-28.31L460-696.08V-880h40v183.92l59.38-59.15 28.31 28.31L480-619.23Z" />
        </svg>
      </button>

      <div
        ref={interactionRef}
        className={styles.interactionLayer}
        data-cursor="interactive"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement | null)?.closest(`.${styles.resetButton}`)) {
            return
          }

          stopInertia()
          markStackCameraInteracted()
          dragStateRef.current.active = true
          dragStateRef.current.lastX = event.clientX
          dragStateRef.current.lastY = event.clientY
          velocityRef.current.theta = 0
          velocityRef.current.phi = 0
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!dragStateRef.current.active) {
            return
          }

          const deltaX = event.clientX - dragStateRef.current.lastX
          const deltaY = event.clientY - dragStateRef.current.lastY
          dragStateRef.current.lastX = event.clientX
          dragStateRef.current.lastY = event.clientY

          const current = useAppStore.getState().stackCamera
          const thetaVelocity = -deltaX * ORBIT_SPEED
          const phiVelocity = deltaY * ORBIT_SPEED

          velocityRef.current.theta = thetaVelocity
          velocityRef.current.phi = phiVelocity
          setStackCamera({
            thetaTarget: current.thetaTarget + thetaVelocity,
            phiTarget: clamp(current.phiTarget + phiVelocity, PHI_MIN, PHI_MAX),
          })
        }}
        onPointerUp={(event) => {
          dragStateRef.current.active = false
          event.currentTarget.releasePointerCapture(event.pointerId)
          startInertia()
        }}
        onPointerCancel={() => {
          dragStateRef.current.active = false
          startInertia()
        }}
        onPointerLeave={() => {
          if (!dragStateRef.current.active) {
            return
          }

          dragStateRef.current.active = false
          startInertia()
        }}
        onTouchStart={(event) => {
          if (event.touches.length === 2) {
            stopInertia()
            markStackCameraInteracted()
            dragStateRef.current.touchDistance = getTouchDistance(event.touches)
          }
        }}
        onTouchMove={(event) => {
          if (event.touches.length !== 2) {
            return
          }

          event.preventDefault()
          const distance = getTouchDistance(event.touches)
          if (dragStateRef.current.touchDistance > 0) {
            const current = useAppStore.getState().stackCamera
            setStackCamera({
              radiusTarget: clamp(
                current.radiusTarget + (dragStateRef.current.touchDistance - distance) * 0.06,
                RADIUS_MIN,
                RADIUS_MAX,
              ),
            })
          }
          dragStateRef.current.touchDistance = distance
        }}
        onTouchEnd={() => {
          dragStateRef.current.touchDistance = 0
        }}
      />
    </section>
  )
}
