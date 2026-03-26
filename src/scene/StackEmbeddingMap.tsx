import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { stackSkillSpecs } from '@/config/content'
import { getPresetForTier } from '@/config/scenePresets'
import { DEFAULT_STACK_PHI, DEFAULT_STACK_RADIUS, DEFAULT_STACK_THETA, useAppStore } from '@/state/appStore'
import { generateStackSceneData, STACK_CUBE_CENTER_Y } from './pointSources'
import { StackLabels } from './StackLabels'

const STACK_CENTER = new THREE.Vector3(0, STACK_CUBE_CENTER_Y, 0)

function sphericalToCartesian(theta: number, phi: number, radius: number) {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

type StackLineSegmentsProps = {
  positions: Float32Array
  color: string
  opacity: number
}

function StackLineSegments({ positions, color, opacity }: StackLineSegmentsProps) {
  return (
    <lineSegments frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} opacity={opacity} transparent />
    </lineSegments>
  )
}

type StackEmbeddingMapProps = {
  active: boolean
}

export function StackEmbeddingMap({ active }: StackEmbeddingMapProps) {
  const deviceTier = useAppStore((state) => state.capabilities.deviceTier)
  const reducedMotion = useAppStore((state) => state.capabilities.reducedMotion)
  const stackCamera = useAppStore((state) => state.stackCamera)
  const { camera } = useThree()

  const preset = getPresetForTier('stackEmbeddingMap', deviceTier)
  const sceneData = useMemo(
    () => generateStackSceneData(preset.count, stackSkillSpecs),
    [preset.count],
  )
  const thetaRef = useRef(DEFAULT_STACK_THETA)
  const phiRef = useRef(DEFAULT_STACK_PHI)
  const radiusRef = useRef(DEFAULT_STACK_RADIUS)
  const wasActiveRef = useRef(false)

  useEffect(() => {
    if (!active) {
      wasActiveRef.current = false
      return
    }

    if (!wasActiveRef.current) {
      thetaRef.current = stackCamera.thetaTarget
      phiRef.current = stackCamera.phiTarget
      radiusRef.current = stackCamera.radiusTarget
      wasActiveRef.current = true
    }
  }, [active, stackCamera.phiTarget, stackCamera.radiusTarget, stackCamera.thetaTarget])

  useFrame(() => {
    if (!active) {
      return
    }

    const smoothing = reducedMotion ? 0.2 : 0.1
    thetaRef.current += (stackCamera.thetaTarget - thetaRef.current) * smoothing
    phiRef.current += (stackCamera.phiTarget - phiRef.current) * smoothing
    radiusRef.current += (stackCamera.radiusTarget - radiusRef.current) * (reducedMotion ? 0.18 : 0.08)

    const position = sphericalToCartesian(thetaRef.current, phiRef.current, radiusRef.current)
    camera.position.copy(STACK_CENTER).add(position)
    camera.lookAt(STACK_CENTER)
    camera.updateProjectionMatrix()
  })

  if (!active) {
    return null
  }

  return (
    <>
      <StackLineSegments positions={sceneData.cubeSegments} color="#5e656d" opacity={0.34} />
      <StackLineSegments positions={sceneData.gridSegments} color="#454b52" opacity={0.17} />
      <StackLabels skills={sceneData.skills} visibility={1} />
    </>
  )
}
