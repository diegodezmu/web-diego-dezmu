import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { alphaConfig, betaConfig, deltaConfig, frameGridConfig, menuGridConfig } from '@/config/curves'
import { stackGroupLayouts, stackSkillSpecs } from '@/config/content'
import { getPresetForTier } from '@/config/scenePresets'
import { useAppStore } from '@/state/appStore'
import {
  fillLissajousPoints,
  fitPointCount,
  generateFrameGridPoints,
  generateStackSceneData,
  generateViewportGridPoints,
} from './pointSources'
import { ParticleField } from './ParticleField'
import { StackEnvironment } from './StackEnvironment'
import { StackLabels } from './StackLabels'
import type { SceneSnapshot } from './types'

function smoothstep(min: number, max: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, amount: number) {
  return a + (b - a) * amount
}

function getResponsiveFrameMargin(width: number) {
  if (width <= 767) {
    return 40
  }

  if (width <= 1200) {
    return 48
  }

  return 72
}

function getViewportWorldDimensions(
  viewportWidthPx: number,
  viewportHeightPx: number,
  cameraZ: number,
  fov: number,
) {
  const worldHeight =
    2 * Math.tan(THREE.MathUtils.degToRad(fov * 0.5)) * Math.abs(cameraZ)

  return {
    width: worldHeight * (viewportWidthPx / Math.max(1, viewportHeightPx)),
    height: worldHeight,
  }
}

function pixelsToWorld(px: number, viewportHeightPx: number, cameraZ: number, fov: number) {
  const { height } = getViewportWorldDimensions(1, viewportHeightPx, cameraZ, fov)
  return (px / Math.max(1, viewportHeightPx)) * height
}

export function ParticleScene() {
  const capabilities = useAppStore((state) => state.capabilities)
  const deviceTier = capabilities.deviceTier
  const menuOpen = useAppStore((state) => state.menuOpen)
  const sceneMode = useAppStore((state) => state.sceneMode)
  const aboutScrollProgress = useAppStore((state) => state.aboutScrollProgress)
  const stackProgress = useAppStore((state) => state.stackProgress)
  const contactProgress = useAppStore((state) => state.contactProgress)
  const stackView = useAppStore((state) => state.stackView)

  const homePreset = getPresetForTier('homeAlpha', deviceTier)
  const aboutPreset = getPresetForTier('aboutBeta', deviceTier)
  const framePreset = getPresetForTier('aboutFrame', deviceTier)
  const stackBridgePreset = getPresetForTier('stackBridge', deviceTier)
  const stackEmbeddingsPreset = getPresetForTier('stackEmbeddings', deviceTier)
  const contactPreset = getPresetForTier('contactDelta', deviceTier)
  const contactOutPreset = getPresetForTier('contactDeltaOut', deviceTier)
  const menuPreset = getPresetForTier('menuGrid', deviceTier)

  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const frameMarginPx = getResponsiveFrameMargin(size.width)

  const homeWorld = useMemo(
    () => getViewportWorldDimensions(size.width, size.height, homePreset.cameraPosition[2], camera.fov),
    [camera.fov, homePreset.cameraPosition, size.height, size.width],
  )
  const aboutWorld = useMemo(
    () => getViewportWorldDimensions(size.width, size.height, aboutPreset.cameraPosition[2], camera.fov),
    [aboutPreset.cameraPosition, camera.fov, size.height, size.width],
  )
  const frameWorld = useMemo(
    () => getViewportWorldDimensions(size.width, size.height, framePreset.cameraPosition[2], camera.fov),
    [camera.fov, framePreset.cameraPosition, size.height, size.width],
  )
  const contactWorld = useMemo(
    () => getViewportWorldDimensions(size.width, size.height, contactPreset.cameraPosition[2], camera.fov),
    [camera.fov, contactPreset.cameraPosition, size.height, size.width],
  )
  const menuWorld = useMemo(
    () => getViewportWorldDimensions(size.width, size.height, menuPreset.cameraPosition[2], camera.fov),
    [camera.fov, menuPreset.cameraPosition, size.height, size.width],
  )

  const homeCount = homePreset.count
  const aboutCount = Math.max(aboutPreset.count, framePreset.count)
  const stackCount = Math.max(stackBridgePreset.count, stackEmbeddingsPreset.count)
  const contactCount = Math.max(contactPreset.count, contactOutPreset.count)

  const homeBufferRef = useRef(new Float32Array(homeCount * 3))
  const aboutBufferRef = useRef(new Float32Array(aboutCount * 3))
  const contactBufferRef = useRef(new Float32Array(contactCount * 3))
  const contactOutBufferRef = useRef(new Float32Array(contactCount * 3))

  const frameWidth = frameWorld.width * ((size.width - frameMarginPx * 2) / Math.max(1, size.width))
  const frameHeight =
    frameWorld.height * ((size.height - frameMarginPx * 2) / Math.max(1, size.height))
  const frameCellWorld = pixelsToWorld(
    frameGridConfig.cellPx,
    size.height,
    framePreset.cameraPosition[2],
    camera.fov,
  )
  const menuCellWorld = pixelsToWorld(
    menuGridConfig.cellPx,
    size.height,
    menuPreset.cameraPosition[2],
    camera.fov,
  )
  const frameSource = useMemo(
    () =>
      fitPointCount(
        generateFrameGridPoints(frameWidth, frameHeight, frameCellWorld, 0.06),
        aboutCount,
      ),
    [aboutCount, frameCellWorld, frameHeight, frameWidth],
  )
  const menuSource = useMemo(
    () =>
      fitPointCount(
        generateViewportGridPoints(menuWorld.width, menuWorld.height, menuCellWorld, 0.04),
        menuPreset.count,
      ),
    [menuCellWorld, menuPreset.count, menuWorld.height, menuWorld.width],
  )
  const stackScene = useMemo(
    () => generateStackSceneData(stackCount, stackSkillSpecs, stackGroupLayouts),
    [stackCount],
  )

  const maxCount = Math.max(homeCount, aboutCount, stackCount, contactCount, menuPreset.count)

  const homePhaseRef = useRef(0)
  const aboutPhaseRef = useRef(0)
  const contactPhaseRef = useRef(0)
  const modeStartedAtRef = useRef(0)
  const previousModeRef = useRef('')

  const snapshotRef = useRef<SceneSnapshot>({
    count: maxCount,
    targets: new Float32Array(maxCount * 3),
    blendTargets: null,
    blend: 0,
    sizePx: homePreset.sizePx,
    opacity: homePreset.opacity,
    orbit: homePreset.orbitMotion,
    drift: homePreset.driftMotion,
    recovery: homePreset.recovery,
    pointerRadiusPx: homePreset.pointerRadiusPx,
    pointerStrength: homePreset.pointerStrength,
    is3D: false,
    cameraPosition: [...homePreset.cameraPosition],
    cameraLookAt: [...homePreset.cameraLookAt],
  })

  useEffect(() => {
    homeBufferRef.current = new Float32Array(homeCount * 3)
  }, [homeCount])

  useEffect(() => {
    aboutBufferRef.current = new Float32Array(aboutCount * 3)
  }, [aboutCount])

  useEffect(() => {
    contactBufferRef.current = new Float32Array(contactCount * 3)
    contactOutBufferRef.current = new Float32Array(contactCount * 3)
  }, [contactCount])

  useEffect(() => {
    snapshotRef.current = {
      ...snapshotRef.current,
      count: maxCount,
      targets: new Float32Array(maxCount * 3),
      cameraPosition: [...snapshotRef.current.cameraPosition],
      cameraLookAt: [...snapshotRef.current.cameraLookAt],
    }
  }, [maxCount])

  useFrame((state, delta) => {
    const pointer = useAppStore.getState().pointer
    const displayMode = menuOpen ? 'menuGrid' : sceneMode
    const snapshot = snapshotRef.current
    const aboutBlend = smoothstep(0.01, 0.16, aboutScrollProgress)
    const stackBlend = smoothstep(0.03, 0.26, stackProgress)
    const contactBlend = smoothstep(0.01, 0.16, contactProgress)
    const homeBuffer = homeBufferRef.current
    const aboutBuffer = aboutBufferRef.current
    const contactBuffer = contactBufferRef.current
    const contactOutBuffer = contactOutBufferRef.current

    if (displayMode !== previousModeRef.current) {
      previousModeRef.current = displayMode
      modeStartedAtRef.current = state.clock.elapsedTime
    }

    const modeElapsed = state.clock.elapsedTime - modeStartedAtRef.current
    snapshot.blendTargets = null
    snapshot.blend = 0
    snapshot.is3D = displayMode === 'stackBridge' || displayMode === 'stackEmbeddings'

    switch (displayMode) {
      case 'aboutBeta':
      case 'aboutFrame': {
        if (!capabilities.reducedMotion) {
          aboutPhaseRef.current += delta * betaConfig.curve.speed * Math.PI * 12
        }

        const thickness = pixelsToWorld(
          betaConfig.particles.strokeWeightPx + betaConfig.particles.haloPx,
          size.height,
          aboutPreset.cameraPosition[2],
          camera.fov,
        )
        fillLissajousPoints(
          aboutBuffer,
          betaConfig.curve,
          aboutPhaseRef.current,
          aboutWorld.width * 0.31,
          aboutWorld.height * 0.3,
          0.22,
          thickness,
        )
        snapshot.targets.set(aboutBuffer)
        snapshot.count = aboutCount
        snapshot.sizePx = lerp(aboutPreset.sizePx, framePreset.sizePx, aboutBlend)
        snapshot.opacity = lerp(aboutPreset.opacity, framePreset.opacity, aboutBlend)
        snapshot.orbit = aboutPreset.orbitMotion
        snapshot.drift = aboutPreset.driftMotion
        snapshot.recovery = lerp(aboutPreset.recovery, framePreset.recovery, aboutBlend)
        snapshot.pointerRadiusPx = aboutPreset.pointerRadiusPx
        snapshot.pointerStrength = aboutPreset.pointerStrength
        snapshot.blendTargets = frameSource
        snapshot.blend = aboutBlend
        snapshot.cameraPosition[0] = pointer.x * 0.06
        snapshot.cameraPosition[1] = pointer.y * 0.05 - aboutBlend * 0.04
        snapshot.cameraPosition[2] = aboutPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = -aboutBlend * 0.08
        snapshot.cameraLookAt[2] = 0
        break
      }
      case 'stackBridge':
      case 'stackEmbeddings': {
        snapshot.targets.set(stackScene.bridgePoints)
        snapshot.count = stackCount
        snapshot.sizePx = lerp(stackBridgePreset.sizePx, stackEmbeddingsPreset.sizePx, stackBlend)
        snapshot.opacity = lerp(stackBridgePreset.opacity, stackEmbeddingsPreset.opacity, stackBlend)
        snapshot.orbit = 0
        snapshot.drift = 0
        snapshot.recovery = lerp(stackBridgePreset.recovery, stackEmbeddingsPreset.recovery, stackBlend)
        snapshot.pointerRadiusPx = stackEmbeddingsPreset.pointerRadiusPx
        snapshot.pointerStrength = stackEmbeddingsPreset.pointerStrength
        snapshot.blendTargets = stackScene.points
        snapshot.blend = stackBlend
        snapshot.cameraPosition[0] = stackView.panX * 0.76
        snapshot.cameraPosition[1] = stackView.panY * 0.54
        snapshot.cameraPosition[2] = lerp(
          stackBridgePreset.cameraPosition[2],
          stackEmbeddingsPreset.cameraPosition[2],
          stackBlend,
        )
        snapshot.cameraLookAt[0] = stackView.panX * 0.18
        snapshot.cameraLookAt[1] = stackView.panY * 0.12 - 0.12
        snapshot.cameraLookAt[2] = 0
        break
      }
      case 'contactDelta':
      case 'contactDeltaOut': {
        if (!capabilities.reducedMotion) {
          contactPhaseRef.current += delta * deltaConfig.curve.speed * Math.PI * 12
        }

        const thickness = pixelsToWorld(
          deltaConfig.particles.strokeWeightPx + deltaConfig.particles.haloPx,
          size.height,
          contactPreset.cameraPosition[2],
          camera.fov,
        )
        fillLissajousPoints(
          contactBuffer,
          deltaConfig.curve,
          contactPhaseRef.current,
          contactWorld.width * 0.28,
          contactWorld.height * 0.29,
          0.26,
          thickness,
        )

        const rise = contactBlend * contactWorld.height * 0.54
        for (let index = 0; index < contactBuffer.length; index += 3) {
          contactOutBuffer[index] = contactBuffer[index]
          contactOutBuffer[index + 1] = contactBuffer[index + 1] + rise
          contactOutBuffer[index + 2] = contactBuffer[index + 2]
        }

        snapshot.targets.set(contactBuffer)
        snapshot.count = contactCount
        snapshot.sizePx = contactPreset.sizePx
        snapshot.opacity = contactPreset.opacity
        snapshot.orbit = contactPreset.orbitMotion
        snapshot.drift = contactPreset.driftMotion
        snapshot.recovery = contactPreset.recovery
        snapshot.pointerRadiusPx = contactPreset.pointerRadiusPx
        snapshot.pointerStrength = contactPreset.pointerStrength
        snapshot.blendTargets = contactOutBuffer
        snapshot.blend = contactBlend
        snapshot.cameraPosition[0] = pointer.x * 0.04
        snapshot.cameraPosition[1] = pointer.y * 0.04 - contactBlend * 0.08
        snapshot.cameraPosition[2] = contactPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = -contactBlend * 0.08
        snapshot.cameraLookAt[2] = 0
        break
      }
      case 'menuGrid': {
        snapshot.targets.set(menuSource)
        snapshot.count = menuPreset.count
        snapshot.sizePx = menuPreset.sizePx
        snapshot.opacity = menuPreset.opacity
        snapshot.orbit = menuPreset.orbitMotion
        snapshot.drift = menuPreset.driftMotion
        snapshot.recovery = menuPreset.recovery
        snapshot.pointerRadiusPx = menuPreset.pointerRadiusPx
        snapshot.pointerStrength = menuPreset.pointerStrength
        snapshot.cameraPosition[0] = pointer.x * 0.02
        snapshot.cameraPosition[1] = pointer.y * 0.02
        snapshot.cameraPosition[2] = menuPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
        snapshot.cameraLookAt[2] = 0
        snapshot.is3D = false
        break
      }
      case 'homeAlpha':
      default: {
        if (!capabilities.reducedMotion) {
          homePhaseRef.current += delta * alphaConfig.curve.speed * Math.PI * 12
        }

        const thickness = pixelsToWorld(
          alphaConfig.particles.strokeWeightPx + alphaConfig.particles.haloPx,
          size.height,
          homePreset.cameraPosition[2],
          camera.fov,
        )
        fillLissajousPoints(
          homeBuffer,
          alphaConfig.curve,
          homePhaseRef.current,
          homeWorld.width * 0.29,
          homeWorld.height * 0.21,
          0.22,
          thickness,
        )
        const moveIn = 1 - smoothstep(0, 0.78, modeElapsed)
        const offsetY = moveIn * homeWorld.height * 0.92
        for (let index = 0; index < homeBuffer.length; index += 3) {
          snapshot.targets[index] = homeBuffer[index]
          snapshot.targets[index + 1] = homeBuffer[index + 1] - offsetY
          snapshot.targets[index + 2] = homeBuffer[index + 2]
        }

        snapshot.count = homeCount
        snapshot.sizePx = homePreset.sizePx + moveIn * 2.1
        snapshot.opacity = Math.min(1, homePreset.opacity + moveIn * 0.24)
        snapshot.orbit = homePreset.orbitMotion
        snapshot.drift = homePreset.driftMotion
        snapshot.recovery = homePreset.recovery
        snapshot.pointerRadiusPx = homePreset.pointerRadiusPx
        snapshot.pointerStrength = homePreset.pointerStrength
        snapshot.cameraPosition[0] = pointer.x * 0.03
        snapshot.cameraPosition[1] = pointer.y * 0.022
        snapshot.cameraPosition[2] = homePreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
        snapshot.cameraLookAt[2] = 0
        snapshot.is3D = false
        break
      }
    }

    const cameraEase =
      displayMode === 'stackBridge' || displayMode === 'stackEmbeddings' ? 0.16 : 0.1

    state.camera.position.x += (snapshot.cameraPosition[0] - state.camera.position.x) * cameraEase
    state.camera.position.y += (snapshot.cameraPosition[1] - state.camera.position.y) * cameraEase
    state.camera.position.z += (snapshot.cameraPosition[2] - state.camera.position.z) * cameraEase
    state.camera.lookAt(
      snapshot.cameraLookAt[0],
      snapshot.cameraLookAt[1],
      snapshot.cameraLookAt[2],
    )
  })

  const stackBridgeVisibility = 1 - smoothstep(0.12, 0.42, stackProgress)
  const stackEmbeddingVisibility = smoothstep(0.06, 0.24, stackProgress)

  return (
    <>
      <StackEnvironment
        connectionSegments={stackScene.connectionSegments}
        floorSegments={stackScene.floorSegments}
        axisSegments={stackScene.axisSegments}
        bridgeVisibility={stackBridgeVisibility}
        embeddingVisibility={stackEmbeddingVisibility}
      />
      <ParticleField key={maxCount} maxCount={maxCount} snapshotRef={snapshotRef} />
      <StackLabels labels={stackScene.labels} visibility={stackEmbeddingVisibility} />
    </>
  )
}
