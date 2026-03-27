import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  aboutMarginGridConfig,
  alphaConfig,
  betaConfig,
  type CurveSceneConfig,
  deltaConfig,
  gammaConfig,
  menuGridConfig,
} from '@/config/curves'
import { stackGroupPalette, stackSkillSpecs } from '@/config/content'
import { getPresetForTier } from '@/config/scenePresets'
import type { ScenePreset } from '@/shared/types'
import {
  DEFAULT_STACK_PHI,
  DEFAULT_STACK_RADIUS,
  DEFAULT_STACK_THETA,
  useAppStore,
} from '@/state/appStore'
import { resolveLfoSceneParameters } from './lfo'
import {
  fillLissajousPoints,
  fitPointCount,
  generateMarginGridPoints,
  generateStackSceneData,
  generateViewportGridPoints,
  STACK_CUBE_CENTER_Y,
} from './pointSources'
import { ParticleField } from './ParticleField'
import { StackEmbeddingMap } from './StackEmbeddingMap'
import type { SceneSnapshot, StackSceneData } from './types'

type StackSceneResources = {
  sceneData: StackSceneData
  particleColors: Float32Array
  particleTargets: Float32Array
  pointCloudMetrics: ReturnType<typeof getPointCloudMetrics>
}

function smoothstep(min: number, max: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, amount: number) {
  return a + (b - a) * amount
}

function getAmplitudeRatio(baseAmplitude: number, modulatedAmplitude: number) {
  return Math.abs(baseAmplitude) <= 1e-6 ? 1 : modulatedAmplitude / baseAmplitude
}

function resolveCurveSceneState(
  sceneKey: string,
  config: CurveSceneConfig,
  particles: ScenePreset,
  elapsedTime: number,
  reducedMotion: boolean,
) {
  return resolveLfoSceneParameters({
    sceneKey,
    curve: config.curve,
    particles,
    lfos: config.lfos,
    elapsedTime,
    reducedMotion,
  })
}

function sphericalToCartesian(theta: number, phi: number, radius: number) {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
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

function blendColorBuffers(source: Float32Array, target: Float32Array, amount: number) {
  const colors = new Float32Array(source.length)

  for (let index = 0; index < source.length; index += 1) {
    colors[index] = source[index] + (target[index] - source[index]) * amount
  }

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

function pushPointsOutsideViewport(
  source: Float32Array,
  width: number,
  height: number,
  overscanX: number,
  overscanY: number,
) {
  const points = new Float32Array(source.length)
  const halfWidth = Math.max(width * 0.5, 1e-6)
  const halfHeight = Math.max(height * 0.5, 1e-6)
  const exitX = halfWidth + overscanX
  const exitY = halfHeight + overscanY

  for (let index = 0; index < source.length; index += 3) {
    const x = source[index]
    const y = source[index + 1]
    const z = source[index + 2]
    const horizontalWeight = Math.abs(x) / halfWidth
    const verticalWeight = Math.abs(y) / halfHeight

    if (horizontalWeight >= verticalWeight) {
      points[index] = (Math.sign(x) || 1) * exitX
      points[index + 1] = y
    } else {
      points[index] = x
      points[index + 1] = (Math.sign(y) || 1) * exitY
    }

    points[index + 2] = z
  }

  return points
}

function getPointCloudMetrics(points: Float32Array) {
  if (points.length < 3) {
    return {
      center: [0, STACK_CUBE_CENTER_Y, 0] as const,
      radius: DEFAULT_STACK_RADIUS,
    }
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY

  for (let index = 0; index < points.length; index += 3) {
    const x = points[index]
    const y = points[index + 1]
    const z = points[index + 2]

    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
  }

  const centerX = (minX + maxX) * 0.5
  const centerY = (minY + maxY) * 0.5
  const centerZ = (minZ + maxZ) * 0.5
  let radius = 0

  for (let index = 0; index < points.length; index += 3) {
    const dx = points[index] - centerX
    const dy = points[index + 1] - centerY
    const dz = points[index + 2] - centerZ
    radius = Math.max(radius, Math.hypot(dx, dy, dz))
  }

  return {
    center: [centerX, centerY, centerZ] as const,
    radius,
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
  const menuOverlayActive = useAppStore((state) => state.menuOverlayActive)
  const sceneMode = useAppStore((state) => state.sceneMode)
  const aboutScrollProgress = useAppStore((state) => state.aboutScrollProgress)
  const contactProgress = useAppStore((state) => state.contactProgress)
  const stackProgress = useAppStore((state) => state.stackProgress)
  const displayMode = (menuOpen || menuOverlayActive) ? 'menuGrid' : sceneMode
  const isStackMode = displayMode === 'stackGamma' || displayMode === 'stackEmbeddingMap'

  const homePreset = getPresetForTier('homeAlpha', deviceTier)
  const aboutPreset = getPresetForTier('aboutBeta', deviceTier)
  const framePreset = getPresetForTier('aboutFrame', deviceTier)
  const stackGammaPreset = getPresetForTier('stackGamma', deviceTier)
  const stackMapPreset = getPresetForTier('stackEmbeddingMap', deviceTier)
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
  const stackGammaWorld = useMemo(
    () =>
      getViewportWorldDimensions(
        size.width,
        size.height,
        stackGammaPreset.cameraPosition[2],
        camera.fov,
      ),
    [camera.fov, size.height, size.width, stackGammaPreset.cameraPosition],
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
  const stackCount = Math.max(stackGammaPreset.count, stackMapPreset.count)
  const contactCount = Math.max(contactPreset.count, contactOutPreset.count)
  const maxCount = Math.max(homeCount, aboutCount, stackCount, contactCount, menuPreset.count)
  const neutralParticleColors = useMemo(
    () => createSolidColorBuffer(maxCount, '#bfbfbf'),
    [maxCount],
  )
  const stackColorBlend = stackProgress

  const homeBufferRef = useRef(new Float32Array(homeCount * 3))
  const aboutBufferRef = useRef(new Float32Array(aboutCount * 3))
  const stackBufferRef = useRef(new Float32Array(stackGammaPreset.count * 3))
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
  const homePhaseRef = useRef(0)
  const aboutPhaseRef = useRef(0)
  const stackPhaseRef = useRef(0)
  const contactPhaseRef = useRef(0)
  const stackZoom = useAppStore((state) => state.stackZoom)
  const stackZoomRef = useRef(stackZoom)
  const stackThetaRef = useRef(DEFAULT_STACK_THETA)
  const stackPhiRef = useRef(DEFAULT_STACK_PHI)
  const modeStartedAtRef = useRef(0)
  const previousModeRef = useRef('')
  const stackResources = useMemo(() => {
    const sceneData = generateStackSceneData(stackMapPreset.count, stackSkillSpecs)
    const stackColorSource = createStackColorBuffer(
      sceneData.skillPoints.length / 3,
      sceneData.skills,
    )

    return {
      sceneData,
      particleColors: fitPointCount(stackColorSource, maxCount),
      particleTargets: fitPointCount(sceneData.skillPoints, maxCount),
      pointCloudMetrics: getPointCloudMetrics(sceneData.skillPoints),
    } satisfies StackSceneResources
  }, [maxCount, stackMapPreset.count])

  const aboutTransitionResources = useMemo(() => {
    const marginSource = fitPointCount(
      generateMarginGridPoints(
        frameWorld.width,
        frameWorld.height,
        aboutMarginCellWorld,
        aboutMarginWorldX,
        aboutMarginWorldY,
        0.04,
      ),
      maxCount,
    )

    return {
      marginSource,
      exitSource: pushPointsOutsideViewport(
        marginSource,
        frameWorld.width,
        frameWorld.height,
        aboutMarginWorldX + aboutMarginCellWorld * 4,
        aboutMarginWorldY + aboutMarginCellWorld * 4,
      ),
    }
  }, [
    aboutMarginCellWorld,
    aboutMarginWorldX,
    aboutMarginWorldY,
    frameWorld.height,
    frameWorld.width,
    maxCount,
  ])

  const menuSource = useMemo(
    () =>
      fitPointCount(
        generateViewportGridPoints(menuWorld.width, menuWorld.height, menuCellWorld, 0.04),
        maxCount,
      ),
    [maxCount, menuCellWorld, menuWorld.height, menuWorld.width],
  )

  const particleColors = useMemo(() => {
    if (!isStackMode) {
      return neutralParticleColors
    }

    return blendColorBuffers(neutralParticleColors, stackResources.particleColors, stackColorBlend)
  }, [isStackMode, neutralParticleColors, stackColorBlend, stackResources])

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
    stackBufferRef.current = new Float32Array(stackGammaPreset.count * 3)
  }, [stackGammaPreset.count])

  useEffect(() => {
    contactBufferRef.current = new Float32Array(contactCount * 3)
    contactOutBufferRef.current = new Float32Array(contactCount * 3)
  }, [contactCount])

  useEffect(() => {
    stackZoomRef.current = stackZoom
  }, [stackZoom])

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
    const store = useAppStore.getState()
    const pointer = store.pointer
    const stackCamera = store.stackCamera
    const elapsedTime = state.clock.elapsedTime
    const snapshot = snapshotRef.current
    const aboutBlend = smoothstep(0.01, 0.16, aboutScrollProgress)
    const stackBlend = stackProgress
    const contactBlend = smoothstep(0.01, 0.16, contactProgress)
    const homeBuffer = homeBufferRef.current
    const aboutBuffer = aboutBufferRef.current
    const stackBuffer = stackBufferRef.current
    const contactBuffer = contactBufferRef.current
    const contactOutBuffer = contactOutBufferRef.current

    if (displayMode !== previousModeRef.current) {
      previousModeRef.current = displayMode
      modeStartedAtRef.current = elapsedTime
    }

    const modeElapsed = elapsedTime - modeStartedAtRef.current
    snapshot.blendTargets = null
    snapshot.blend = 0
    snapshot.is3D = false
    snapshot.rotationX = 0
    snapshot.rotationY = 0
    snapshot.rotationZ = 0

    if (isStackMode) {
      const stackSceneResources = stackResources
      const gammaScene = resolveCurveSceneState(
        'stackGamma',
        gammaConfig,
        stackGammaPreset,
        elapsedTime,
        capabilities.reducedMotion,
      )

      if (!capabilities.reducedMotion && gammaScene.curve.animate) {
        stackPhaseRef.current += delta * gammaScene.curve.speed * Math.PI * 12
      }

      const thickness = pixelsToWorld(
        gammaScene.particles.strokeWeightPx + gammaScene.particles.haloPx,
        size.height,
        stackGammaPreset.cameraPosition[2],
        camera.fov,
      )
      fillLissajousPoints(
        stackBuffer,
        gammaScene.curve,
        stackPhaseRef.current,
        stackGammaWorld.width *
        0.3 *
        getAmplitudeRatio(gammaConfig.curve.ampX, gammaScene.curve.ampX),
        stackGammaWorld.height *
        0.26 *
        getAmplitudeRatio(gammaConfig.curve.ampY, gammaScene.curve.ampY),
        0.22,
        thickness,
      )

      fillFittedTriplets(snapshot.targets, stackBuffer, maxCount)
      snapshot.count = maxCount
      snapshot.sizePx = lerp(gammaScene.particles.sizePx, stackMapPreset.sizePx, stackBlend)
      snapshot.opacity = lerp(gammaScene.particles.opacity, stackMapPreset.opacity, stackBlend)
      snapshot.orbit = lerp(
        gammaScene.particles.orbitMotion,
        capabilities.reducedMotion ? 0 : 0.045,
        stackBlend,
      )
      snapshot.drift = lerp(
        gammaScene.particles.driftMotion,
        capabilities.reducedMotion ? 0 : 0.040,
        stackBlend,
      )
      snapshot.recovery = lerp(gammaScene.particles.recovery, stackMapPreset.recovery, stackBlend)
      snapshot.pointerRadiusPx = lerp(gammaScene.particles.pointerRadiusPx, 0, stackBlend)
      snapshot.pointerStrength = lerp(gammaScene.particles.pointerStrength, 0, stackBlend)
      snapshot.blendTargets = stackSceneResources.particleTargets
      snapshot.blend = stackBlend
      snapshot.is3D = stackBlend > 0.04

      const orbitSmoothing = capabilities.reducedMotion ? 0.2 : 0.1
      stackThetaRef.current += (stackCamera.thetaTarget - stackThetaRef.current) * orbitSmoothing
      stackPhiRef.current += (stackCamera.phiTarget - stackPhiRef.current) * orbitSmoothing

      const orbitPosition = sphericalToCartesian(
        stackThetaRef.current,
        stackPhiRef.current,
        Math.max(DEFAULT_STACK_RADIUS, stackSceneResources.pointCloudMetrics.radius * 3.35) *
        stackZoomRef.current,
      )
      const gammaCameraX = pointer.x * 0.035
      const gammaCameraY = pointer.y * 0.028
      const mapCameraX = stackSceneResources.pointCloudMetrics.center[0] + orbitPosition.x
      const mapCameraY = stackSceneResources.pointCloudMetrics.center[1] + orbitPosition.y
      const mapCameraZ = stackSceneResources.pointCloudMetrics.center[2] + orbitPosition.z

      snapshot.cameraPosition[0] = lerp(gammaCameraX, mapCameraX, stackBlend)
      snapshot.cameraPosition[1] = lerp(gammaCameraY, mapCameraY, stackBlend)
      snapshot.cameraPosition[2] = lerp(stackGammaPreset.cameraPosition[2], mapCameraZ, stackBlend)
      snapshot.cameraLookAt[0] = lerp(0, stackSceneResources.pointCloudMetrics.center[0], stackBlend)
      snapshot.cameraLookAt[1] = lerp(0, stackSceneResources.pointCloudMetrics.center[1], stackBlend)
      snapshot.cameraLookAt[2] = lerp(0, stackSceneResources.pointCloudMetrics.center[2], stackBlend)
    } else {
      switch (displayMode) {
        case 'aboutBeta':
        case 'aboutFrame': {
          const aboutScene = resolveCurveSceneState(
            'aboutBeta',
            betaConfig,
            aboutPreset,
            elapsedTime,
            capabilities.reducedMotion,
          )

          if (!capabilities.reducedMotion && aboutScene.curve.animate) {
            aboutPhaseRef.current += delta * aboutScene.curve.speed * Math.PI * 12
          }

          const thickness = pixelsToWorld(
            aboutScene.particles.strokeWeightPx + aboutScene.particles.haloPx,
            size.height,
            aboutPreset.cameraPosition[2],
            camera.fov,
          )
          fillLissajousPoints(
            aboutBuffer,
            aboutScene.curve,
            aboutPhaseRef.current,
            aboutWorld.width * 0.32 * getAmplitudeRatio(betaConfig.curve.ampX, aboutScene.curve.ampX),
            aboutWorld.height *
            0.22 *
            getAmplitudeRatio(betaConfig.curve.ampY, aboutScene.curve.ampY),
            0.22,
            thickness,
          )
          fillFittedTriplets(snapshot.targets, aboutBuffer, maxCount)
          snapshot.count = maxCount
          snapshot.sizePx = lerp(aboutScene.particles.sizePx, framePreset.sizePx, aboutBlend)
          snapshot.opacity = lerp(aboutScene.particles.opacity, framePreset.opacity, aboutBlend)
          snapshot.orbit = aboutScene.particles.orbitMotion
          snapshot.drift = aboutScene.particles.driftMotion
          snapshot.recovery = lerp(aboutScene.particles.recovery, framePreset.recovery, aboutBlend)
          snapshot.pointerRadiusPx = aboutScene.particles.pointerRadiusPx
          snapshot.pointerStrength = aboutScene.particles.pointerStrength
          snapshot.blendTargets = aboutTransitionResources.exitSource
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
          const contactScene = resolveCurveSceneState(
            'contactDelta',
            deltaConfig,
            contactPreset,
            elapsedTime,
            capabilities.reducedMotion,
          )

          if (!capabilities.reducedMotion && contactScene.curve.animate) {
            contactPhaseRef.current += delta * contactScene.curve.speed * Math.PI * 12
          }

          const thickness = pixelsToWorld(
            contactScene.particles.strokeWeightPx + contactScene.particles.haloPx,
            size.height,
            contactPreset.cameraPosition[2],
            camera.fov,
          )
          fillLissajousPoints(
            contactBuffer,
            contactScene.curve,
            contactPhaseRef.current,
            contactWorld.width *
            0.26 *
            getAmplitudeRatio(deltaConfig.curve.ampX, contactScene.curve.ampX),
            contactWorld.height *
            0.26 *
            getAmplitudeRatio(deltaConfig.curve.ampY, contactScene.curve.ampY),
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
          snapshot.sizePx = contactScene.particles.sizePx
          snapshot.opacity = contactScene.particles.opacity
          snapshot.orbit = contactScene.particles.orbitMotion
          snapshot.drift = contactScene.particles.driftMotion
          snapshot.recovery = contactScene.particles.recovery
          snapshot.pointerRadiusPx = contactScene.particles.pointerRadiusPx
          snapshot.pointerStrength = contactScene.particles.pointerStrength
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
          break
        }
        case 'homeAlpha':
        default: {
          const homeScene = resolveCurveSceneState(
            'homeAlpha',
            alphaConfig,
            homePreset,
            elapsedTime,
            capabilities.reducedMotion,
          )

          if (!capabilities.reducedMotion && homeScene.curve.animate) {
            homePhaseRef.current += delta * homeScene.curve.speed * Math.PI * 12
          }

          const thickness = pixelsToWorld(
            homeScene.particles.strokeWeightPx + homeScene.particles.haloPx,
            size.height,
            homePreset.cameraPosition[2],
            camera.fov,
          )
          fillLissajousPoints(
            homeBuffer,
            homeScene.curve,
            homePhaseRef.current,
            homeWorld.width * 0.18 * getAmplitudeRatio(alphaConfig.curve.ampX, homeScene.curve.ampX),
            homeWorld.height * 0.18 * getAmplitudeRatio(alphaConfig.curve.ampY, homeScene.curve.ampY),
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
          snapshot.sizePx = homeScene.particles.sizePx + moveIn * 2.1
          snapshot.opacity = Math.min(1, homeScene.particles.opacity + moveIn * 0.24)
          snapshot.orbit = homeScene.particles.orbitMotion
          snapshot.drift = homeScene.particles.driftMotion
          snapshot.recovery = homeScene.particles.recovery
          snapshot.pointerRadiusPx = homeScene.particles.pointerRadiusPx
          snapshot.pointerStrength = homeScene.particles.pointerStrength
          snapshot.cameraPosition[0] = pointer.x * 0.03
          snapshot.cameraPosition[1] = pointer.y * 0.022
          snapshot.cameraPosition[2] = homePreset.cameraPosition[2]
          snapshot.cameraLookAt[0] = 0
          snapshot.cameraLookAt[1] = 0
          snapshot.cameraLookAt[2] = 0
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
      <StackEmbeddingMap
        active={isStackMode}
        sceneData={isStackMode && stackProgress > 0.001 ? stackResources?.sceneData ?? null : null}
        visibility={stackProgress}
      />
    </>
  )
}
