import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { aboutMarginGridConfig, alphaConfig, betaConfig, deltaConfig, menuGridConfig } from '@/config/curves'
import { stackGroupPalette, stackSkillSpecs } from '@/config/content'
import { getPresetForTier } from '@/config/scenePresets'
import { useAppStore } from '@/state/appStore'
import {
  fillLissajousPoints,
  fitPointCount,
  generateStackSceneData,
  generateMarginGridPoints,
  generateViewportGridPoints,
} from './pointSources'
import { ParticleField } from './ParticleField'
import { StackEmbeddingMap } from './StackEmbeddingMap'
import type { SceneSnapshot } from './types'

function smoothstep(min: number, max: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, amount: number) {
  return a + (b - a) * amount
}

function hexToFloatColor(hex: string) {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex
  const value = Number.parseInt(normalized, 16)

  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ] as const
}

function createSolidColorBuffer(count: number, hex: string) {
  const colors = new Float32Array(count * 3)
  const [red, green, blue] = hexToFloatColor(hex)

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    colors[offset] = red
    colors[offset + 1] = green
    colors[offset + 2] = blue
  }

  return colors
}

function createStackColorBuffer(
  pointCount: number,
  skills: ReturnType<typeof generateStackSceneData>['skills'],
) {
  const colors = new Float32Array(pointCount * 3)

  skills.forEach((skill) => {
    const [red, green, blue] = hexToFloatColor(stackGroupPalette[skill.group])
    for (let pointIndex = skill.pointRange[0]; pointIndex < skill.pointRange[1]; pointIndex += 1) {
      const offset = pointIndex * 3
      colors[offset] = red
      colors[offset + 1] = green
      colors[offset + 2] = blue
    }
  })

  return colors
}

function fillFittedTriplets(target: Float32Array, source: Float32Array, count: number) {
  const sourceCount = source.length / 3

  if (sourceCount === 0) {
    target.fill(0)
    return
  }

  if (sourceCount === count) {
    target.set(source)
    return
  }

  for (let index = 0; index < count; index += 1) {
    const sourceIndex = Math.floor((index / count) * sourceCount) % sourceCount
    const sourceOffset = sourceIndex * 3
    const targetOffset = index * 3
    target[targetOffset] = source[sourceOffset]
    target[targetOffset + 1] = source[sourceOffset + 1]
    target[targetOffset + 2] = source[sourceOffset + 2]
  }
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
  const contactProgress = useAppStore((state) => state.contactProgress)
  const displayMode = menuOpen ? 'menuGrid' : sceneMode

  const homePreset = getPresetForTier('homeAlpha', deviceTier)
  const aboutPreset = getPresetForTier('aboutBeta', deviceTier)
  const framePreset = getPresetForTier('aboutFrame', deviceTier)
  const stackPreset = getPresetForTier('stackEmbeddingMap', deviceTier)
  const contactPreset = getPresetForTier('contactDelta', deviceTier)
  const contactOutPreset = getPresetForTier('contactDeltaOut', deviceTier)
  const menuPreset = getPresetForTier('menuGrid', deviceTier)
  const stackSceneData = useMemo(
    () => generateStackSceneData(stackPreset.count, stackSkillSpecs),
    [stackPreset.count],
  )

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
  const contactCount = Math.max(contactPreset.count, contactOutPreset.count)
  const maxCount = Math.max(homeCount, aboutCount, contactCount, menuPreset.count, stackPreset.count)
  const stackColorSource = useMemo(
    () => createStackColorBuffer(stackSceneData.skillPoints.length / 3, stackSceneData.skills),
    [stackSceneData.skillPoints.length, stackSceneData.skills],
  )
  const stackParticleTargets = useMemo(
    () => fitPointCount(stackSceneData.skillPoints, maxCount),
    [maxCount, stackSceneData.skillPoints],
  )
  const neutralParticleColors = useMemo(
    () => createSolidColorBuffer(maxCount, '#bfbfbf'),
    [maxCount],
  )
  const stackParticleColors = useMemo(
    () => fitPointCount(stackColorSource, maxCount),
    [maxCount, stackColorSource],
  )
  const particleColors = displayMode === 'stackEmbeddingMap' ? stackParticleColors : neutralParticleColors

  const homeBufferRef = useRef(new Float32Array(homeCount * 3))
  const aboutBufferRef = useRef(new Float32Array(aboutCount * 3))
  const contactBufferRef = useRef(new Float32Array(contactCount * 3))
  const contactOutBufferRef = useRef(new Float32Array(contactCount * 3))
  const blendBufferRef = useRef(new Float32Array(maxCount * 3))

  const aboutMarginCellWorld = pixelsToWorld(
    aboutMarginGridConfig.cellPx,
    size.height,
    framePreset.cameraPosition[2],
    camera.fov,
  )
  const aboutMarginWorldX = frameWorld.width * (frameMarginPx / Math.max(1, size.width))
  const aboutMarginWorldY = frameWorld.height * (frameMarginPx / Math.max(1, size.height))
  const menuCellWorld = pixelsToWorld(
    menuGridConfig.cellPx,
    size.height,
    menuPreset.cameraPosition[2],
    camera.fov,
  )
  const aboutMarginSource = useMemo(
    () =>
      fitPointCount(
        generateMarginGridPoints(
          frameWorld.width,
          frameWorld.height,
          aboutMarginCellWorld,
          aboutMarginWorldX,
          aboutMarginWorldY,
          0.04,
        ),
        maxCount,
      ),
    [aboutMarginCellWorld, aboutMarginWorldX, aboutMarginWorldY, frameWorld.height, frameWorld.width, maxCount],
  )
  const menuSource = useMemo(
    () =>
      fitPointCount(
        generateViewportGridPoints(menuWorld.width, menuWorld.height, menuCellWorld, 0.04),
        maxCount,
      ),
    [maxCount, menuCellWorld, menuWorld.height, menuWorld.width],
  )

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
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
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
      rotationX: snapshotRef.current.rotationX,
      rotationY: snapshotRef.current.rotationY,
      rotationZ: snapshotRef.current.rotationZ,
    }
    blendBufferRef.current = new Float32Array(maxCount * 3)
  }, [maxCount])

  useFrame((state, delta) => {
    const pointer = useAppStore.getState().pointer
    const snapshot = snapshotRef.current
    const aboutBlend = smoothstep(0.01, 0.16, aboutScrollProgress)
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
    snapshot.is3D = false
    snapshot.rotationX = 0
    snapshot.rotationY = 0
    snapshot.rotationZ = 0

    if (displayMode === 'stackEmbeddingMap') {
      snapshot.targets.set(stackParticleTargets)
      snapshot.count = maxCount
      snapshot.sizePx = stackPreset.sizePx
      snapshot.opacity = stackPreset.opacity
      snapshot.orbit = capabilities.reducedMotion ? 0 : 0.018
      snapshot.drift = capabilities.reducedMotion ? 0 : 0.008
      snapshot.recovery = stackPreset.recovery
      snapshot.pointerRadiusPx = 0
      snapshot.pointerStrength = 0
      snapshot.is3D = true
      snapshot.cameraPosition[0] = state.camera.position.x
      snapshot.cameraPosition[1] = state.camera.position.y
      snapshot.cameraPosition[2] = state.camera.position.z
      snapshot.cameraLookAt[0] = stackPreset.cameraLookAt[0]
      snapshot.cameraLookAt[1] = stackPreset.cameraLookAt[1]
      snapshot.cameraLookAt[2] = stackPreset.cameraLookAt[2]
    } else {
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
            aboutWorld.width * 0.32,
            aboutWorld.height * 0.22,
            0.22,
            thickness,
          )
          fillFittedTriplets(snapshot.targets, aboutBuffer, maxCount)
          snapshot.count = maxCount
          snapshot.sizePx = lerp(aboutPreset.sizePx, framePreset.sizePx, aboutBlend)
          snapshot.opacity = lerp(aboutPreset.opacity, framePreset.opacity, aboutBlend)
          snapshot.orbit = aboutPreset.orbitMotion
          snapshot.drift = aboutPreset.driftMotion
          snapshot.recovery = lerp(aboutPreset.recovery, framePreset.recovery, aboutBlend)
          snapshot.pointerRadiusPx = aboutPreset.pointerRadiusPx
          snapshot.pointerStrength = aboutPreset.pointerStrength
          snapshot.blendTargets = aboutMarginSource
          snapshot.blend = aboutBlend
          snapshot.cameraPosition[0] = pointer.x * 0.06
          snapshot.cameraPosition[1] = pointer.y * 0.05 - aboutBlend * 0.04
          snapshot.cameraPosition[2] = aboutPreset.cameraPosition[2]
          snapshot.cameraLookAt[0] = 0
          snapshot.cameraLookAt[1] = -aboutBlend * 0.08
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
            contactWorld.width * 0.26,
            contactWorld.height * 0.26,
            0.26,
            thickness,
          )

          const rise = contactBlend * contactWorld.height * 0.54
          for (let index = 0; index < contactBuffer.length; index += 3) {
            contactOutBuffer[index] = contactBuffer[index]
            contactOutBuffer[index + 1] = contactBuffer[index + 1] + rise
            contactOutBuffer[index + 2] = contactBuffer[index + 2]
          }

          fillFittedTriplets(snapshot.targets, contactBuffer, maxCount)
          fillFittedTriplets(blendBufferRef.current, contactOutBuffer, maxCount)
          snapshot.count = maxCount
          snapshot.sizePx = contactPreset.sizePx
          snapshot.opacity = contactPreset.opacity
          snapshot.orbit = contactPreset.orbitMotion
          snapshot.drift = contactPreset.driftMotion
          snapshot.recovery = contactPreset.recovery
          snapshot.pointerRadiusPx = contactPreset.pointerRadiusPx
          snapshot.pointerStrength = contactPreset.pointerStrength
          snapshot.blendTargets = blendBufferRef.current
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
          snapshot.count = maxCount
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
            homeWorld.width * 0.25,
            homeWorld.height * 0.17,
            0.22,
            thickness,
          )
          const moveIn = 1 - smoothstep(0, 0.78, modeElapsed)
          const offsetY = moveIn * homeWorld.height * 0.92
          for (let index = 0; index < homeBuffer.length; index += 3) {
            homeBuffer[index + 1] -= offsetY
          }

          fillFittedTriplets(snapshot.targets, homeBuffer, maxCount)
          snapshot.count = maxCount
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
    }
    const cameraEase = 0.1

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
      <ParticleField key={maxCount} maxCount={maxCount} snapshotRef={snapshotRef} baseColors={particleColors} />
      <StackEmbeddingMap active={displayMode === 'stackEmbeddingMap'} />
    </>
  )
}
