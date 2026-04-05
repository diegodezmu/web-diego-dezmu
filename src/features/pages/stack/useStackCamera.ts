import { useEffect, useRef } from 'react'
import { STACK_ZOOM_MIN, STACK_ZOOM_STEP, getStackZoomMax } from '@/shared/utils/stackZoom'
import { DEFAULT_STACK_PHI, useAppStore } from '@/state/appStore'

const THETA_MIN = -Infinity
const THETA_MAX = Infinity
const PHI_MIN = Math.max(Math.PI * 0.2, DEFAULT_STACK_PHI - 0.7)
const PHI_MAX = Math.min(Math.PI * 0.7, DEFAULT_STACK_PHI + 0.6)
const ORBIT_SPEED = 0.006
const TOUCH_ORBIT_SPEED = 0.0048
const DAMPING = 0.9

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function useStackCamera(stackProgress: number) {
  const stackCamera = useAppStore((state) => state.stackCamera)
  const stackZoom = useAppStore((state) => state.stackZoom)
  const isTouch = useAppStore((state) => state.capabilities.isTouch)
  const setStackCamera = useAppStore((state) => state.setStackCamera)
  const markStackCameraInteracted = useAppStore((state) => state.markStackCameraInteracted)
  const setStackZoom = useAppStore((state) => state.setStackZoom)
  const zoomMax = getStackZoomMax()
  const velocityRef = useRef({
    theta: 0,
    phi: 0,
  })
  const inertiaFrameRef = useRef<number | null>(null)

  const stopInertia = () => {
    if (inertiaFrameRef.current !== null) {
      window.cancelAnimationFrame(inertiaFrameRef.current)
      inertiaFrameRef.current = null
    }
  }

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

  useEffect(
    () => () => {
      if (inertiaFrameRef.current !== null) {
        window.cancelAnimationFrame(inertiaFrameRef.current)
      }
    },
    [],
  )

  return {
    hintOpacity:
      !isTouch && stackProgress > 0.5 && !stackCamera.hasInteracted
        ? Math.min(1, (stackProgress - 0.5) * 4)
        : 0,
    zoomOpacity: Math.min(1, Math.max(0, (stackProgress - 0.5) * 4)),
    stopInertia,
    startInertia,
    applyOrbit,
    handleZoomOut: () => setStackZoom(clamp(stackZoom + STACK_ZOOM_STEP, STACK_ZOOM_MIN, zoomMax)),
    handleZoomIn: () => setStackZoom(clamp(stackZoom - STACK_ZOOM_STEP, STACK_ZOOM_MIN, zoomMax)),
    isZoomOutDisabled: stackZoom >= zoomMax,
    isZoomInDisabled: stackZoom <= STACK_ZOOM_MIN,
  }
}
