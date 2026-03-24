import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { alphaConfig, betaConfig, deltaConfig, frameGridConfig, gammaConfig, menuGridConfig } from '@/config/curves'
import { stackClusterConfig } from '@/config/content'
import { getPresetForTier } from '@/config/scenePresets'
import { useAppStore } from '@/state/appStore'
import {
  fillLissajousPoints,
  fitPointCount,
  generateFrameGridPoints,
  generateNebulaCloud,
  generateViewportGridPoints,
  rotatePointCloudY,
} from './pointSources'
import { ParticleField } from './ParticleField'
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
  const stackGammaPreset = getPresetForTier('stackGamma', deviceTier)
  const stackNebulaPreset = getPresetForTier('stackNebula', deviceTier)
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
  const stackWorld = useMemo(
    () =>
      getViewportWorldDimensions(size.width, size.height, stackNebulaPreset.cameraPosition[2], camera.fov),
    [camera.fov, size.height, size.width, stackNebulaPreset.cameraPosition],
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
  const stackCount = Math.max(stackGammaPreset.count, stackNebulaPreset.count)
  const contactCount = Math.max(contactPreset.count, contactOutPreset.count)

  const homeBufferRef = useRef(new Float32Array(homeCount * 3))
  const aboutBufferRef = useRef(new Float32Array(aboutCount * 3))
  const stackBufferRef = useRef(new Float32Array(stackCount * 3))
  const contactBufferRef = useRef(new Float32Array(contactCount * 3))
  const contactOutBufferRef = useRef(new Float32Array(contactCount * 3))
  const rotatedNebulaBufferRef = useRef(new Float32Array(stackCount * 3))

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
  const stackSource = useMemo(() => generateNebulaCloud(stackCount, stackClusterConfig), [stackCount])

  const maxCount = Math.max(homeCount, aboutCount, stackCount, contactCount, menuPreset.count)

  const homePhaseRef = useRef(0)
  const aboutPhaseRef = useRef(0)
  const stackPhaseRef = useRef(0)
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
    stackBufferRef.current = new Float32Array(stackCount * 3)
    rotatedNebulaBufferRef.current = new Float32Array(stackCount * 3)
  }, [stackCount])

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
    const stackBlend = smoothstep(0.14, 0.72, stackProgress)
    const contactBlend = smoothstep(0.14, 0.88, contactProgress)
    const aboutBlend = smoothstep(0.04, 0.28, aboutScrollProgress)
    const homeBuffer = homeBufferRef.current
    const aboutBuffer = aboutBufferRef.current
    const stackBuffer = stackBufferRef.current
    const contactBuffer = contactBufferRef.current
    const contactOutBuffer = contactOutBufferRef.current
    const rotatedNebulaBuffer = rotatedNebulaBufferRef.current

    if (displayMode !== previousModeRef.current) {
      previousModeRef.current = displayMode
      modeStartedAtRef.current = state.clock.elapsedTime
    }

    const modeElapsed = state.clock.elapsedTime - modeStartedAtRef.current
    snapshot.blendTargets = null
    snapshot.blend = 0
    snapshot.is3D = displayMode === 'stackGamma' || displayMode === 'stackNebula'

    switch (displayMode) {
      case 'aboutBeta': {
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
        snapshot.sizePx = aboutPreset.sizePx
        snapshot.opacity = aboutPreset.opacity
        snapshot.orbit = aboutPreset.orbitMotion
        snapshot.drift = aboutPreset.driftMotion
        snapshot.recovery = aboutPreset.recovery
        snapshot.pointerRadiusPx = aboutPreset.pointerRadiusPx
        snapshot.pointerStrength = aboutPreset.pointerStrength
        snapshot.blendTargets = frameSource
        snapshot.blend = aboutBlend
        snapshot.cameraPosition[0] = pointer.x * 0.06
        snapshot.cameraPosition[1] = pointer.y * 0.05
        snapshot.cameraPosition[2] = aboutPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
        snapshot.cameraLookAt[2] = 0
        break
      }
      case 'stackGamma':
      case 'stackNebula': {
        if (!capabilities.reducedMotion) {
          stackPhaseRef.current += delta * gammaConfig.curve.speed * Math.PI * 12
        }

        const thickness = pixelsToWorld(
          gammaConfig.particles.strokeWeightPx + gammaConfig.particles.haloPx,
          size.height,
          stackGammaPreset.cameraPosition[2],
          camera.fov,
        )
        fillLissajousPoints(
          stackBuffer,
          gammaConfig.curve,
          stackPhaseRef.current,
          stackWorld.width * 0.28,
          stackWorld.height * 0.26,
          0.26,
          thickness,
        )
        const spinAngle = capabilities.reducedMotion ? 0 : state.clock.elapsedTime * stackNebulaPreset.spin
        rotatePointCloudY(stackSource.points, rotatedNebulaBuffer, spinAngle)
        snapshot.targets.set(stackBuffer)
        snapshot.count = stackCount
        snapshot.sizePx = lerp(stackGammaPreset.sizePx, stackNebulaPreset.sizePx, stackBlend)
        snapshot.opacity = lerp(stackGammaPreset.opacity, stackNebulaPreset.opacity, stackBlend)
        snapshot.orbit = lerp(stackGammaPreset.orbitMotion, stackNebulaPreset.orbitMotion, stackBlend)
        snapshot.drift = lerp(stackGammaPreset.driftMotion, stackNebulaPreset.driftMotion, stackBlend)
        snapshot.recovery = lerp(stackGammaPreset.recovery, stackNebulaPreset.recovery, stackBlend)
        snapshot.pointerRadiusPx = stackNebulaPreset.pointerRadiusPx
        snapshot.pointerStrength = lerp(
          stackGammaPreset.pointerStrength,
          stackNebulaPreset.pointerStrength,
          stackBlend,
        )
        snapshot.blendTargets = rotatedNebulaBuffer
        snapshot.blend = stackBlend
        snapshot.cameraPosition[0] = stackView.panX * (0.72 + stackBlend * 0.92)
        snapshot.cameraPosition[1] = stackView.panY * (0.52 + stackBlend * 0.72)
        snapshot.cameraPosition[2] = lerp(
          stackGammaPreset.cameraPosition[2],
          stackNebulaPreset.cameraPosition[2],
          stackBlend,
        )
        snapshot.cameraLookAt[0] = stackView.panX * 0.18
        snapshot.cameraLookAt[1] = stackView.panY * 0.14
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
          contactWorld.width * 0.3,
          contactWorld.height * 0.31,
          0.26,
          thickness,
        )

        const rise = contactBlend * contactWorld.height * 0.86
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
        snapshot.cameraPosition[1] = pointer.y * 0.04 - contactBlend * 0.12
        snapshot.cameraPosition[2] = contactPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
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
        const moveIn = 1 - smoothstep(0, 0.84, modeElapsed)
        const offsetY = moveIn * homeWorld.height * 0.66
        for (let index = 0; index < homeBuffer.length; index += 3) {
          snapshot.targets[index] = homeBuffer[index]
          snapshot.targets[index + 1] = homeBuffer[index + 1] - offsetY
          snapshot.targets[index + 2] = homeBuffer[index + 2]
        }

        snapshot.count = homeCount
        snapshot.sizePx = homePreset.sizePx
        snapshot.opacity = homePreset.opacity
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
      displayMode === 'stackGamma' || displayMode === 'stackNebula' ? 0.14 + stackBlend * 0.08 : 0.08

    state.camera.position.x += (snapshot.cameraPosition[0] - state.camera.position.x) * cameraEase
    state.camera.position.y += (snapshot.cameraPosition[1] - state.camera.position.y) * cameraEase
    state.camera.position.z += (snapshot.cameraPosition[2] - state.camera.position.z) * cameraEase
    state.camera.lookAt(
      snapshot.cameraLookAt[0],
      snapshot.cameraLookAt[1],
      snapshot.cameraLookAt[2],
    )
  })

  return (
    <>
      <ParticleField key={maxCount} maxCount={maxCount} snapshotRef={snapshotRef} />
      <StackLabels labels={stackSource.labels} spin={stackNebulaPreset.spin} />
    </>
  )
}
