import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { alphaCurve, betaCurve } from '@/config/curves'
import { stackClusterConfig } from '@/config/content'
import { getPresetForTier } from '@/config/scenePresets'
import { assets } from '@/shared/assets'
import { useAppStore } from '@/state/appStore'
import {
  fillLissajousPoints,
  generateFramePoints,
  generateFullscreenPoints,
  generateStackCloud,
  sampleSvgAreaPoints,
} from './pointSources'
import { ParticleField } from './ParticleField'
import { StackLabels } from './StackLabels'
import type { SceneSnapshot } from './types'

function smoothstep(min: number, max: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

function copyPoints(target: Float32Array, source: Float32Array) {
  target.set(source)
}

function getResponsiveFrameMargin(width: number) {
  if (width <= 767) {
    return 24
  }

  if (width <= 1024) {
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

export function ParticleScene() {
  const capabilities = useAppStore((state) => state.capabilities)
  const deviceTier = capabilities.deviceTier
  const menuOpen = useAppStore((state) => state.menuOpen)
  const sceneMode = useAppStore((state) => state.sceneMode)
  const aboutScrollProgress = useAppStore((state) => state.aboutScrollProgress)
  const stackView = useAppStore((state) => state.stackView)

  const logoPreset = getPresetForTier('logo', deviceTier)
  const aboutPreset = getPresetForTier('aboutCurve', deviceTier)
  const framePreset = getPresetForTier('aboutFrame', deviceTier)
  const stackPreset = getPresetForTier('stackCloud', deviceTier)
  const contactPreset = getPresetForTier('contactCurve', deviceTier)
  const menuPreset = getPresetForTier('menuFlood', deviceTier)
  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const frameMarginPx = getResponsiveFrameMargin(size.width)
  const logoCameraZ = logoPreset.cameraPosition[2]
  const frameCameraZ = framePreset.cameraPosition[2]
  const logoWorld = useMemo(
    () => getViewportWorldDimensions(size.width, size.height, logoCameraZ, camera.fov),
    [camera.fov, logoCameraZ, size.height, size.width],
  )
  const frameWorld = useMemo(
    () => getViewportWorldDimensions(size.width, size.height, frameCameraZ, camera.fov),
    [camera.fov, frameCameraZ, size.height, size.width],
  )
  const logoWidth = logoWorld.width * 0.6
  const logoHeight = logoWidth * (0.64 / 5.2)
  const frameWidth = frameWorld.width * ((size.width - frameMarginPx * 2) / Math.max(1, size.width))
  const frameHeight =
    frameWorld.height * ((size.height - frameMarginPx * 2) / Math.max(1, size.height))
  const maxCount = Math.max(
    logoPreset.count,
    aboutPreset.count,
    framePreset.count,
    stackPreset.count,
    contactPreset.count,
    menuPreset.count,
  )

  const logoSource = useMemo(
    () => sampleSvgAreaPoints(assets.logoDisplaySvg, logoPreset.count, logoWidth, logoHeight, 0.2),
    [logoHeight, logoPreset.count, logoWidth],
  )
  const aboutFrameSource = useMemo(
    () => generateFramePoints(framePreset.count, frameWidth, frameHeight, 0.28),
    [frameHeight, framePreset.count, frameWidth],
  )
  const menuSource = useMemo(
    () => generateFullscreenPoints(menuPreset.count, 11.8, 7.4, 1.2),
    [menuPreset.count],
  )
  const stackSource = useMemo(
    () => generateStackCloud(stackPreset.count, stackClusterConfig),
    [stackPreset.count],
  )

  const alphaBufferRef = useRef(new Float32Array(aboutPreset.count * 3))
  const betaBufferRef = useRef(new Float32Array(contactPreset.count * 3))
  const phaseAlphaRef = useRef(0)
  const phaseBetaRef = useRef(0)
  const blendSourceRef = useRef<Float32Array | null>(null)
  const snapshotRef = useRef<SceneSnapshot>({
    count: logoPreset.count,
    targets: new Float32Array(maxCount * 3),
    blendTargets: null,
    blend: 0,
    size: logoPreset.size,
    opacity: logoPreset.opacity,
    jitter: logoPreset.jitter,
    orbit: logoPreset.orbit,
    drift: logoPreset.drift,
    recovery: logoPreset.recovery,
    pointerRadiusPx: logoPreset.pointerRadiusPx,
    pointerStrength: logoPreset.pointerStrength,
    is3D: false,
    cameraPosition: [...logoPreset.cameraPosition] as [number, number, number],
    cameraLookAt: [...logoPreset.cameraLookAt] as [number, number, number],
  })

  useFrame((state, delta) => {
    const displayMode = menuOpen ? 'menuFlood' : sceneMode
    const snapshot = snapshotRef.current
    const pointer = useAppStore.getState().pointer
    blendSourceRef.current = null
    snapshot.blend = 0
    snapshot.is3D = displayMode === 'stackCloud'

    switch (displayMode) {
      case 'aboutCurve': {
        if (!capabilities.reducedMotion) {
          phaseAlphaRef.current += delta * alphaCurve.speed * Math.PI * 12
        }

        fillLissajousPoints(
          alphaBufferRef.current,
          alphaCurve,
          phaseAlphaRef.current,
          1.3,
          1.09,
          0.17,
          0.15,
        )
        copyPoints(snapshot.targets, alphaBufferRef.current)
        snapshot.count = aboutPreset.count
        snapshot.size = aboutPreset.size
        snapshot.opacity = aboutPreset.opacity
        snapshot.jitter = aboutPreset.jitter
        snapshot.orbit = aboutPreset.orbit
        snapshot.drift = aboutPreset.drift
        snapshot.recovery = aboutPreset.recovery
        snapshot.pointerRadiusPx = aboutPreset.pointerRadiusPx
        snapshot.pointerStrength = aboutPreset.pointerStrength
        snapshot.cameraPosition[0] = pointer.x * 0.08
        snapshot.cameraPosition[1] = pointer.y * 0.06
        snapshot.cameraPosition[2] = aboutPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
        snapshot.cameraLookAt[2] = 0
        snapshot.blend = smoothstep(0.01, 0.24, aboutScrollProgress)
        blendSourceRef.current = aboutFrameSource
        break
      }
      case 'stackCloud': {
        copyPoints(snapshot.targets, stackSource.points)
        snapshot.count = stackPreset.count
        snapshot.size = stackPreset.size
        snapshot.opacity = stackPreset.opacity
        snapshot.jitter = stackPreset.jitter
        snapshot.orbit = capabilities.reducedMotion ? 0.006 : stackPreset.orbit
        snapshot.drift = capabilities.reducedMotion ? 0 : stackPreset.drift
        snapshot.recovery = stackPreset.recovery
        snapshot.pointerRadiusPx = stackPreset.pointerRadiusPx
        snapshot.pointerStrength = stackPreset.pointerStrength
        {
          const targetCameraX = stackView.panX * 2.8
          const targetCameraY = stackView.panY * 1.95
          const targetCameraZ = 13.4 - stackView.zoom * 4.8
          const targetLookAtX = stackView.panX * 0.82
          const targetLookAtY = stackView.panY * 0.52

          snapshot.cameraPosition[0] = targetCameraX
          snapshot.cameraPosition[1] = targetCameraY
          snapshot.cameraPosition[2] = targetCameraZ
          snapshot.cameraLookAt[0] = targetLookAtX
          snapshot.cameraLookAt[1] = targetLookAtY
        }
        snapshot.cameraLookAt[2] = 0
        break
      }
      case 'contactCurve': {
        if (!capabilities.reducedMotion) {
          phaseBetaRef.current += delta * betaCurve.speed * Math.PI * 12
        }

        fillLissajousPoints(
          betaBufferRef.current,
          betaCurve,
          phaseBetaRef.current,
          1.25,
          1.025,
          0.19,
          0.15,
        )
        copyPoints(snapshot.targets, betaBufferRef.current)
        snapshot.count = contactPreset.count
        snapshot.size = contactPreset.size
        snapshot.opacity = contactPreset.opacity
        snapshot.jitter = contactPreset.jitter
        snapshot.orbit = contactPreset.orbit
        snapshot.drift = contactPreset.drift
        snapshot.recovery = contactPreset.recovery
        snapshot.pointerRadiusPx = contactPreset.pointerRadiusPx
        snapshot.pointerStrength = contactPreset.pointerStrength
        snapshot.cameraPosition[0] = pointer.x * 0.07
        snapshot.cameraPosition[1] = pointer.y * 0.05
        snapshot.cameraPosition[2] = contactPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
        snapshot.cameraLookAt[2] = 0
        break
      }
      case 'menuFlood': {
        copyPoints(snapshot.targets, menuSource)
        snapshot.count = menuPreset.count
        snapshot.size = menuPreset.size
        snapshot.opacity = menuPreset.opacity
        snapshot.jitter = menuPreset.jitter
        snapshot.orbit = menuPreset.orbit
        snapshot.drift = menuPreset.drift
        snapshot.recovery = menuPreset.recovery
        snapshot.pointerRadiusPx = menuPreset.pointerRadiusPx
        snapshot.pointerStrength = menuPreset.pointerStrength
        snapshot.cameraPosition[0] = pointer.x * 0.04
        snapshot.cameraPosition[1] = pointer.y * 0.04
        snapshot.cameraPosition[2] = menuPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
        snapshot.cameraLookAt[2] = 0
        break
      }
      case 'logo':
      default: {
        copyPoints(snapshot.targets, logoSource)
        snapshot.count = logoPreset.count
        snapshot.size = logoPreset.size
        snapshot.opacity = logoPreset.opacity
        snapshot.jitter = logoPreset.jitter
        snapshot.orbit = logoPreset.orbit
        snapshot.drift = logoPreset.drift
        snapshot.recovery = logoPreset.recovery
        snapshot.pointerRadiusPx = logoPreset.pointerRadiusPx
        snapshot.pointerStrength = logoPreset.pointerStrength
        snapshot.cameraPosition[0] = pointer.x * 0.04
        snapshot.cameraPosition[1] = pointer.y * 0.028
        snapshot.cameraPosition[2] = logoPreset.cameraPosition[2]
        snapshot.cameraLookAt[0] = 0
        snapshot.cameraLookAt[1] = 0
        snapshot.cameraLookAt[2] = 0
        break
      }
    }

    snapshot.blendTargets = blendSourceRef.current

    const cameraEase = displayMode === 'stackCloud' ? 0.22 + stackView.zoom * 0.08 : 0.08

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
      <StackLabels labels={stackSource.labels} />
    </>
  )
}
