import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/state/appStore'
import type { SceneSnapshot } from './types'

function createInitialPositions(maxCount: number) {
  const points = new Float32Array(maxCount * 3)

  for (let index = 0; index < points.length; index += 1) {
    const seed = Math.sin((index + 1) * 12.9898) * 43758.5453
    points[index] = ((seed - Math.floor(seed)) * 2 - 1) * 2
  }

  return points
}

function createInitialColors(maxCount: number) {
  const colors = new Float32Array(maxCount * 3)

  for (let index = 0; index < colors.length; index += 1) {
    colors[index] = 0.75
  }

  return colors
}

function createSpriteTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  if (!context) {
    return new THREE.Texture()
  }

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.28, 'rgba(255,255,255,0.92)')
  gradient.addColorStop(0.64, 'rgba(255,255,255,0.22)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

type ParticleFieldProps = {
  maxCount: number
  snapshotRef: React.MutableRefObject<SceneSnapshot>
}

export function ParticleField({ maxCount, snapshotRef }: ParticleFieldProps) {
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)
  const positions = useMemo(() => createInitialPositions(maxCount), [maxCount])
  const colors = useMemo(() => createInitialColors(maxCount), [maxCount])
  const positionsRef = useRef(positions)
  const colorsRef = useRef(colors)
  const spriteTexture = useMemo(() => createSpriteTexture(), [])
  const pointerWorld = useMemo(() => new THREE.Vector3(), [])
  const rayTarget = useMemo(() => new THREE.Vector3(), [])
  const rayDirection = useMemo(() => new THREE.Vector3(), [])
  const { camera } = useThree()

  useFrame((state, delta) => {
    const snapshot = snapshotRef.current
    const positions = positionsRef.current
    const colors = colorsRef.current
    const geometry = geometryRef.current
    const material = materialRef.current
    const { pointer, capabilities } = useAppStore.getState()

    if (!geometry || !material) {
      return
    }

    const blendTargets = snapshot.blendTargets
    const blend = snapshot.blend
    const hasPointer = pointer.inside && !capabilities.isTouch
    const distanceToParticlePlane = Math.max(0.1, Math.abs(camera.position.z))
    const verticalWorldSpan =
      2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov * 0.5)) *
      distanceToParticlePlane
    const pointerRadiusWorld =
      (snapshot.pointerRadiusPx / Math.max(1, state.size.height)) * verticalWorldSpan
    const lerpFactor = 1 - Math.pow(1 - Math.min(snapshot.recovery, 0.96), delta * 60)

    if (hasPointer) {
      rayTarget.set(pointer.x, pointer.y, 0.5).unproject(camera)
      rayDirection.copy(rayTarget).sub(camera.position).normalize()
      const distance = rayDirection.z === 0 ? 0 : -camera.position.z / rayDirection.z
      pointerWorld.copy(camera.position).addScaledVector(rayDirection, distance)
    }

    for (let index = 0; index < snapshot.count; index += 1) {
      const offset = index * 3
      let targetX = snapshot.targets[offset]
      let targetY = snapshot.targets[offset + 1]
      let targetZ = snapshot.targets[offset + 2]

      if (blendTargets) {
        targetX += (blendTargets[offset] - targetX) * blend
        targetY += (blendTargets[offset + 1] - targetY) * blend
        targetZ += (blendTargets[offset + 2] - targetZ) * blend
      }

      if (snapshot.orbit > 0 && !capabilities.reducedMotion) {
        const orbitPhase = state.clock.elapsedTime * 0.56 + index * 0.017
        targetX += Math.sin(orbitPhase) * snapshot.orbit
        targetY += Math.cos(orbitPhase * 1.14) * snapshot.orbit
        if (snapshot.is3D) {
          targetZ += Math.sin(orbitPhase * 0.82) * snapshot.orbit * 1.28
        }
      }

      if (snapshot.drift > 0 && !capabilities.reducedMotion) {
        const driftPhase = state.clock.elapsedTime * 0.16 + index * 0.011
        targetX += Math.sin(driftPhase * 0.93) * snapshot.drift
        targetY += Math.cos(driftPhase * 0.71 + index * 0.003) * snapshot.drift * 0.86
        if (snapshot.is3D) {
          targetZ += Math.sin(driftPhase * 0.58 + index * 0.005) * snapshot.drift * 0.82
        }
      }

      let currentX = positions[offset]
      let currentY = positions[offset + 1]
      let currentZ = positions[offset + 2]

      currentX += (targetX - currentX) * lerpFactor
      currentY += (targetY - currentY) * lerpFactor
      currentZ += (targetZ - currentZ) * lerpFactor

      let glow = 0

      if (hasPointer) {
        const deltaX = currentX - pointerWorld.x
        const deltaY = currentY - pointerWorld.y
        const deltaZ = snapshot.is3D ? currentZ - pointerWorld.z : 0
        const distance = Math.hypot(deltaX, deltaY, deltaZ) || 1

        if (distance < pointerRadiusWorld) {
          glow = (1 - distance / pointerRadiusWorld) ** 2
          const force = (glow * snapshot.pointerStrength) / distance
          currentX += deltaX * force
          currentY += deltaY * force
          currentZ += deltaZ * force * 0.7
        }
      }

      positions[offset] = currentX
      positions[offset + 1] = currentY
      positions[offset + 2] = currentZ

      const intensity = snapshot.opacity + (1 - snapshot.opacity) * glow
      colors[offset] = intensity
      colors[offset + 1] = intensity
      colors[offset + 2] = intensity
    }

    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    geometry.setDrawRange(0, snapshot.count)
    material.size = (snapshot.sizePx / Math.max(1, state.size.height)) * verticalWorldSpan
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        alphaMap={spriteTexture}
        alphaTest={0.02}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={1}
        size={0.05}
        sizeAttenuation
        transparent
        vertexColors
      />
    </points>
  )
}
