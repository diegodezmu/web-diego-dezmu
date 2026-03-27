import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { ZoomInIcon, ZoomOutIcon } from '@/shared/components/InlineIcons'
import {
  DEFAULT_STACK_PHI,
  useAppStore,
} from '@/state/appStore'

// ─── Zoom limits — adjust these to taste ────────────────────────────────────
const ZOOM_MIN = 0.4   // most zoomed in  (camera closest)
const ZOOM_MAX = 1.0   // default view — zoom out not allowed beyond this
const ZOOM_STEP = 0.2
// ────────────────────────────────────────────────────────────────────────────
import styles from './StackPage.module.css'

const STACK_TRANSITION_DURATION_S = 2
const THETA_MIN = -Infinity
const THETA_MAX = Infinity
const PHI_MIN = Math.max(Math.PI * 0.2, DEFAULT_STACK_PHI - 0.7)
const PHI_MAX = Math.min(Math.PI * 0.7, DEFAULT_STACK_PHI + 0.6)
const ORBIT_SPEED = 0.006
const TOUCH_ORBIT_SPEED = 0.0048
const DAMPING = 0.9
const GESTURE_THRESHOLD = 8

type GestureMode = 'idle' | 'pending' | 'vertical' | 'orbit'

type InteractionState = {
  active: boolean
  pointerType: string
  mode: GestureMode
  lastX: number
  lastY: number
  startX: number
  startY: number
}

type TitleInteractionState = {
  active: boolean
  moved: boolean
  pointerType: string
  startY: number
  lastY: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function StackPage() {
  const shellRef = useRef<HTMLElement | null>(null)
  const interactionRef = useRef<HTMLDivElement | null>(null)
  const titleInteractionRef = useRef<TitleInteractionState>({
    active: false,
    moved: false,
    pointerType: '',
    startY: 0,
    lastY: 0,
  })
  const interactionStateRef = useRef<InteractionState>({
    active: false,
    pointerType: '',
    mode: 'idle',
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  })
  const velocityRef = useRef({
    theta: 0,
    phi: 0,
  })
  const inertiaFrameRef = useRef<number | null>(null)
  const stackProgressTweenRef = useRef<gsap.core.Tween | null>(null)
  const stackProgressValueRef = useRef({ value: 0 })
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)
  const previousContentRevealKeyRef = useRef(contentRevealKey)
  const stackStateTarget = useAppStore((state) => state.stackStateTarget)
  const stackProgress = useAppStore((state) => state.stackProgress)
  const stackCamera = useAppStore((state) => state.stackCamera)
  const isTouch = useAppStore((state) => state.capabilities.isTouch)
  const setSceneMode = useAppStore((state) => state.setSceneMode)
  const setStackStateTarget = useAppStore((state) => state.setStackStateTarget)
  const setStackProgress = useAppStore((state) => state.setStackProgress)
  const setStackCamera = useAppStore((state) => state.setStackCamera)
  const markStackCameraInteracted = useAppStore((state) => state.markStackCameraInteracted)
  const stackZoom = useAppStore((state) => state.stackZoom)
  const setStackZoom = useAppStore((state) => state.setStackZoom)

  const stopInertia = () => {
    if (inertiaFrameRef.current !== null) {
      window.cancelAnimationFrame(inertiaFrameRef.current)
      inertiaFrameRef.current = null
    }
  }

  useEffect(() => {
    stackProgressValueRef.current.value = stackProgress
  }, [stackProgress])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.titleBlock}`,
        { autoAlpha: 0, y: '15vh' },
        { autoAlpha: 1, y: 0, duration: 3, ease: 'power3.out' },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    if (contentRevealKey === previousContentRevealKeyRef.current) {
      return
    }

    previousContentRevealKeyRef.current = contentRevealKey

    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.titleBlock}`,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power2.out' },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [contentRevealKey])

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

    setStackZoom(1)

    if (stackStateTarget === 1) {
      setStackCamera({ hasInteracted: false })
    }

    stackProgressTweenRef.current?.kill()
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
  }, [setStackCamera, setStackProgress, setStackZoom, stackStateTarget])

  useEffect(() => {
    const layer = interactionRef.current
    if (!layer) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (event.deltaY === 0) {
        return
      }

      setStackStateTarget(event.deltaY > 0 ? 1 : 0)
    }

    layer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      layer.removeEventListener('wheel', handleWheel)
    }
  }, [setStackStateTarget])

  useEffect(
    () => () => {
      stopInertia()
      stackProgressTweenRef.current?.kill()
    },
    [],
  )

  const applyOrbit = (deltaX: number, deltaY: number, horizontalOnly = false) => {
    stopInertia()
    markStackCameraInteracted()

    const current = useAppStore.getState().stackCamera
    const thetaVelocity = deltaX * (horizontalOnly ? TOUCH_ORBIT_SPEED : ORBIT_SPEED)
    const phiVelocity = horizontalOnly ? 0 : -deltaY * ORBIT_SPEED

    velocityRef.current.theta = thetaVelocity
    velocityRef.current.phi = phiVelocity

    setStackCamera({
      thetaTarget: clamp(current.thetaTarget + thetaVelocity, THETA_MIN, THETA_MAX),
      phiTarget: clamp(current.phiTarget + phiVelocity, PHI_MIN, PHI_MAX),
    })
  }

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
        thetaTarget: clamp(current.thetaTarget + velocityRef.current.theta, THETA_MIN, THETA_MAX),
        phiTarget: clamp(current.phiTarget + velocityRef.current.phi, PHI_MIN, PHI_MAX),
      })

      inertiaFrameRef.current = window.requestAnimationFrame(tick)
    }

    inertiaFrameRef.current = window.requestAnimationFrame(tick)
  }

  const revealProgress = stackProgress
  const titleOpacity = 1 - Math.min(1, revealProgress * 1.24)
  const titleShift = revealProgress * 16
  const hintOpacity =
    !isTouch && revealProgress > 0.5 && !stackCamera.hasInteracted
      ? Math.min(1, (revealProgress - 0.5) * 4)
      : 0
  const zoomOpacity = Math.min(1, Math.max(0, (revealProgress - 0.5) * 4))

  return (
    <section ref={shellRef} className={styles.page}>
      <button
        className={styles.titleAnchor}
        type="button"
        style={{
          opacity: titleOpacity,
          transform: `translate(-50%, calc(-50% - ${titleShift}vh))`,
        }}
        onWheel={(event) => {
          event.stopPropagation()
          event.preventDefault()
          if (event.deltaY === 0) {
            return
          }

          setStackStateTarget(event.deltaY > 0 ? 1 : 0)
        }}
        onPointerDown={(event) => {
          titleInteractionRef.current = {
            active: true,
            moved: false,
            pointerType: event.pointerType,
            startY: event.clientY,
            lastY: event.clientY,
          }
          event.stopPropagation()
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const interaction = titleInteractionRef.current
          if (!interaction.active || interaction.pointerType !== 'touch') {
            return
          }

          const deltaY = event.clientY - interaction.lastY
          interaction.lastY = event.clientY

          if (!interaction.moved && Math.abs(event.clientY - interaction.startY) >= GESTURE_THRESHOLD) {
            interaction.moved = true
          }

          if (!interaction.moved || Math.abs(deltaY) < 1) {
            return
          }

          event.preventDefault()
          event.stopPropagation()
          setStackStateTarget(deltaY < 0 ? 1 : 0)
        }}
        onPointerUp={(event) => {
          const interaction = titleInteractionRef.current
          const shouldToggle = interaction.active && !interaction.moved

          titleInteractionRef.current = {
            active: false,
            moved: false,
            pointerType: '',
            startY: 0,
            lastY: 0,
          }

          event.stopPropagation()
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }

          if (!shouldToggle) {
            return
          }

          setStackStateTarget(stackProgress < 0.5 ? 1 : 0)
        }}
        onPointerCancel={(event) => {
          titleInteractionRef.current = {
            active: false,
            moved: false,
            pointerType: '',
            startY: 0,
            lastY: 0,
          }

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        data-cursor="interactive"
      >
        <PageTitle as="span" className={styles.titleBlock} title={siteContent.stackTitle} />
      </button>

      <div className={styles.hint} style={{ opacity: hintOpacity }}>
        Drag to orbit
      </div>

      <div
        ref={interactionRef}
        className={styles.interactionLayer}
        onPointerDown={(event) => {
          const stackActive = useAppStore.getState().stackProgress > 0.001
          const isTouchInput = event.pointerType === 'touch'

          if (!isTouchInput && !stackActive) {
            return
          }

          stopInertia()
          interactionStateRef.current = {
            active: true,
            pointerType: event.pointerType,
            mode: isTouchInput ? 'pending' : 'orbit',
            lastX: event.clientX,
            lastY: event.clientY,
            startX: event.clientX,
            startY: event.clientY,
          }

          if (!isTouchInput) {
            markStackCameraInteracted()
          }

          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const interaction = interactionStateRef.current
          if (!interaction.active) {
            return
          }

          if (interaction.pointerType === 'touch') {
            event.preventDefault()

            if (interaction.mode === 'pending') {
              const deltaX = event.clientX - interaction.startX
              const deltaY = event.clientY - interaction.startY

              if (
                Math.abs(deltaX) < GESTURE_THRESHOLD &&
                Math.abs(deltaY) < GESTURE_THRESHOLD
              ) {
                return
              }

              if (
                useAppStore.getState().stackProgress > 0.001 &&
                Math.abs(deltaX) > Math.abs(deltaY)
              ) {
                interaction.mode = 'orbit'
                interaction.lastX = event.clientX
                interaction.lastY = event.clientY
                markStackCameraInteracted()
                return
              }

              interaction.mode = 'vertical'
              interaction.lastY = event.clientY
            }

            if (interaction.mode === 'vertical') {
              const deltaY = event.clientY - interaction.lastY
              interaction.lastY = event.clientY
              if (Math.abs(deltaY) < 1) {
                return
              }

              setStackStateTarget(deltaY < 0 ? 1 : 0)
              return
            }

            if (interaction.mode === 'orbit') {
              const deltaX = event.clientX - interaction.lastX
              interaction.lastX = event.clientX
              applyOrbit(deltaX, 0, true)
            }

            return
          }

          if (interaction.mode !== 'orbit') {
            return
          }

          const deltaX = event.clientX - interaction.lastX
          const deltaY = event.clientY - interaction.lastY
          interaction.lastX = event.clientX
          interaction.lastY = event.clientY
          applyOrbit(deltaX, deltaY)
        }}
        onPointerUp={(event) => {
          const interaction = interactionStateRef.current
          const shouldInertia = interaction.active && interaction.mode === 'orbit'

          interactionStateRef.current = {
            active: false,
            pointerType: '',
            mode: 'idle',
            lastX: 0,
            lastY: 0,
            startX: 0,
            startY: 0,
          }

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }

          if (shouldInertia) {
            startInertia()
          }
        }}
        onPointerCancel={(event) => {
          const interaction = interactionStateRef.current
          const shouldInertia = interaction.active && interaction.mode === 'orbit'

          interactionStateRef.current = {
            active: false,
            pointerType: '',
            mode: 'idle',
            lastX: 0,
            lastY: 0,
            startX: 0,
            startY: 0,
          }

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }

          if (shouldInertia) {
            startInertia()
          }
        }}
        onPointerLeave={() => {
          const interaction = interactionStateRef.current
          if (!interaction.active) {
            return
          }

          const shouldInertia = interaction.mode === 'orbit'
          interactionStateRef.current = {
            active: false,
            pointerType: '',
            mode: 'idle',
            lastX: 0,
            lastY: 0,
            startX: 0,
            startY: 0,
          }

          if (shouldInertia) {
            startInertia()
          }
        }}
      />

      <div className={styles.zoomControls} style={{ opacity: zoomOpacity }}>
        <button
          className={styles.zoomButton}
          type="button"
          aria-label="Zoom out"
          data-cursor="interactive"
          disabled={stackZoom >= ZOOM_MAX}
          onClick={() => setStackZoom(clamp(stackZoom + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX))}
        >
          <span className={styles.zoomButtonInner}>
            <ZoomOutIcon />
          </span>
        </button>

        <button
          className={styles.zoomButton}
          type="button"
          aria-label="Zoom in"
          data-cursor="interactive"
          disabled={stackZoom <= ZOOM_MIN}
          onClick={() => setStackZoom(clamp(stackZoom - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX))}
        >
          <span className={styles.zoomButtonInner}>
            <ZoomInIcon />
          </span>
        </button>
      </div>
    </section>
  )
}
