import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { useAppStore } from '@/state/appStore'

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

type StackGestureOptions = {
  stackProgress: number
  stopInertia: () => void
  startInertia: () => void
  applyOrbit: (deltaX: number, deltaY: number, horizontalOnly?: boolean) => void
}

function createTitleInteractionState(): TitleInteractionState {
  return {
    active: false,
    moved: false,
    pointerType: '',
    startY: 0,
    lastY: 0,
  }
}

function createInteractionState(): InteractionState {
  return {
    active: false,
    pointerType: '',
    mode: 'idle',
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  }
}

export function useStackGestures({
  stackProgress,
  stopInertia,
  startInertia,
  applyOrbit,
}: StackGestureOptions) {
  const interactionRef = useRef<HTMLDivElement | null>(null)
  const titleInteractionRef = useRef<TitleInteractionState>(createTitleInteractionState())
  const interactionStateRef = useRef<InteractionState>(createInteractionState())
  const setStackStateTarget = useAppStore((state) => state.setStackStateTarget)
  const markStackCameraInteracted = useAppStore((state) => state.markStackCameraInteracted)

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

  const resetTitleInteraction = () => {
    titleInteractionRef.current = createTitleInteractionState()
  }

  const resetLayerInteraction = () => {
    interactionStateRef.current = createInteractionState()
  }

  const handleTitleWheel = (event: ReactWheelEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    if (event.deltaY === 0) {
      return
    }

    setStackStateTarget(event.deltaY > 0 ? 1 : 0)
  }

  const handleTitlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    titleInteractionRef.current = {
      active: true,
      moved: false,
      pointerType: event.pointerType,
      startY: event.clientY,
      lastY: event.clientY,
    }
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleTitlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
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
  }

  const handleTitlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const interaction = titleInteractionRef.current
    const shouldToggle = interaction.active && !interaction.moved

    resetTitleInteraction()

    event.stopPropagation()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (!shouldToggle) {
      return
    }

    setStackStateTarget(stackProgress < 0.5 ? 1 : 0)
  }

  const handleTitlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    resetTitleInteraction()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleTitleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) {
      return
    }

    setStackStateTarget(stackProgress < 0.5 ? 1 : 0)
  }

  const handleInteractionPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
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
  }

  const handleInteractionPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
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
  }

  const finishInteraction = () => {
    const interaction = interactionStateRef.current
    const shouldInertia = interaction.active && interaction.mode === 'orbit'

    resetLayerInteraction()

    if (shouldInertia) {
      startInertia()
    }
  }

  const handleInteractionPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const shouldInertia = interactionStateRef.current.active && interactionStateRef.current.mode === 'orbit'

    resetLayerInteraction()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (shouldInertia) {
      startInertia()
    }
  }

  const handleInteractionPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const shouldInertia = interactionStateRef.current.active && interactionStateRef.current.mode === 'orbit'

    resetLayerInteraction()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (shouldInertia) {
      startInertia()
    }
  }

  const handleInteractionPointerLeave = () => {
    if (!interactionStateRef.current.active) {
      return
    }

    finishInteraction()
  }

  return {
    interactionRef,
    titleHandlers: {
      onClick: handleTitleClick,
      onWheel: handleTitleWheel,
      onPointerDown: handleTitlePointerDown,
      onPointerMove: handleTitlePointerMove,
      onPointerUp: handleTitlePointerUp,
      onPointerCancel: handleTitlePointerCancel,
    },
    interactionLayerHandlers: {
      onPointerDown: handleInteractionPointerDown,
      onPointerMove: handleInteractionPointerMove,
      onPointerUp: handleInteractionPointerUp,
      onPointerCancel: handleInteractionPointerCancel,
      onPointerLeave: handleInteractionPointerLeave,
    },
  }
}
