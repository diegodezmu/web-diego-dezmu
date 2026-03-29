import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PARTICLE_TINT_COLOR } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import type { SceneSnapshot } from './types'

/** Rango de dispersión inicial de las partículas.
 *  Controla cuánto de lejos empiezan antes de converger.
 *  0 = sin dispersión (comportamiento anterior).
 *  Ajustar visualmente: 2-5 es el rango útil. */
const INITIAL_SCATTER_RANGE = 3.0
const HOLD_TARGET_OPACITY = 0.5

function createInitialPositions(maxCount: number) {
  const points = new Float32Array(maxCount * 3)

  for (let index = 0; index < points.length; index += 1) {
    points[index] = (Math.random() - 0.5) * 2 * INITIAL_SCATTER_RANGE
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
  initialPositions?: Float32Array | null
  livePositionsRef?: React.MutableRefObject<Float32Array | null>
}

export function ParticleField({
  maxCount,
  snapshotRef,
  initialPositions,
  livePositionsRef,
}: ParticleFieldProps) {
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)
  const positions = useMemo(() => {
    if (initialPositions && initialPositions.length === maxCount * 3) {
      return new Float32Array(initialPositions)
    }

    return createInitialPositions(maxCount)
  }, [initialPositions, maxCount])
  const colors = useMemo(() => createInitialColors(maxCount), [maxCount])
  const positionsRef = useRef(positions)
  const colorsRef = useRef(colors)
  const holdMixRef = useRef<number>(0)
  const explodeAmountRef = useRef<number>(0)
  const lastExplodeVersionRef = useRef<number>(0)
  const spriteTexture = useMemo(() => createSpriteTexture(), [])
  const particleTintColor = useMemo(() => new THREE.Color(PARTICLE_TINT_COLOR), [])
  const pointerWorld = useMemo(() => new THREE.Vector3(), [])
  const rayTarget = useMemo(() => new THREE.Vector3(), [])
  const rayDirection = useMemo(() => new THREE.Vector3(), [])
  const focusTarget = useMemo(() => new THREE.Vector3(), [])
  const { camera } = useThree()

  useEffect(() => {
    if (!livePositionsRef) {
      return
    }

    livePositionsRef.current = positionsRef.current
  }, [livePositionsRef])

  useFrame((state, delta) => {
    const snapshot = snapshotRef.current
    const positions = positionsRef.current
    const targets = snapshot.targets
    const colors = colorsRef.current
    const geometry = geometryRef.current
    const material = materialRef.current
    const { pointer, capabilities, holdStartTime, sceneMode, explodeVersion, explodeStrength } =
      useAppStore.getState()

    if (!geometry || !material) {
      return
    }

    material.color.copy(particleTintColor)

    if (sceneMode === 'stackEmbeddingMap') {
      if (holdStartTime !== null) {
        const elapsed = (Date.now() - holdStartTime) / 1000
        const targetMix = Math.min(1, elapsed / 0.3)
        holdMixRef.current = targetMix
      } else {
        holdMixRef.current = Math.max(0, holdMixRef.current - delta / 0.6)
      }
    } else {
      holdMixRef.current = 0
    }

    const effectiveOpacity =
      sceneMode === 'stackEmbeddingMap'
        ? THREE.MathUtils.lerp(snapshot.opacity, HOLD_TARGET_OPACITY, holdMixRef.current)
        : snapshot.opacity

    const blendTargets = snapshot.blendTargets
    const blend = snapshot.blend
    const hasPointer = pointer.inside && !capabilities.isTouch
    focusTarget.set(
      snapshot.cameraLookAt[0],
      snapshot.cameraLookAt[1],
      snapshot.cameraLookAt[2],
    )
    const distanceToParticlePlane = Math.max(0.1, camera.position.distanceTo(focusTarget))
    const verticalWorldSpan =
      2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov * 0.5)) *
      distanceToParticlePlane
    const pointerRadiusWorld =
      (snapshot.pointerRadiusPx / Math.max(1, state.size.height)) * verticalWorldSpan
    const lerpFactor =
      1 - Math.pow(1 - Math.min(snapshot.recovery * 1.28, 0.96), delta * 72)
    const hasSceneRotation =
      snapshot.rotationX !== 0 || snapshot.rotationY !== 0 || snapshot.rotationZ !== 0
    const cosX = Math.cos(snapshot.rotationX)
    const sinX = Math.sin(snapshot.rotationX)
    const cosY = Math.cos(snapshot.rotationY)
    const sinY = Math.sin(snapshot.rotationY)
    const cosZ = Math.cos(snapshot.rotationZ)
    const sinZ = Math.sin(snapshot.rotationZ)

    if (hasPointer) {
      rayTarget.set(pointer.x, pointer.y, 0.5).unproject(camera)
      rayDirection.copy(rayTarget).sub(camera.position).normalize()
      const distance = rayDirection.z === 0 ? 0 : -camera.position.z / rayDirection.z
      pointerWorld.copy(camera.position).addScaledVector(rayDirection, distance)
    }

    if (explodeVersion !== lastExplodeVersionRef.current) {
      explodeAmountRef.current = explodeStrength
      lastExplodeVersionRef.current = explodeVersion
    }

    const explodeAmt = explodeAmountRef.current

    if (explodeAmt > 0) {
      for (let index = 0; index < snapshot.count; index += 1) {
        const offset = index * 3
        let targetX = targets[offset]
        let targetY = targets[offset + 1]
        let targetZ = targets[offset + 2]

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

        if (hasSceneRotation) {
          const rotatedY = targetY * cosX - targetZ * sinX
          const rotatedZAfterX = targetY * sinX + targetZ * cosX
          const rotatedXAfterY = targetX * cosY + rotatedZAfterX * sinY
          const rotatedZAfterY = -targetX * sinY + rotatedZAfterX * cosY
          const rotatedX = rotatedXAfterY * cosZ - rotatedY * sinZ
          const rotatedYFinal = rotatedXAfterY * sinZ + rotatedY * cosZ

          targetX = rotatedX
          targetY = rotatedYFinal
          targetZ = rotatedZAfterY
        }

        targetX += targetX * explodeAmt
        targetY += targetY * explodeAmt
        targetZ += targetZ * explodeAmt

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

        const intensity = Math.min(1, effectiveOpacity * (1 + snapshot.glowBoost * glow))
        colors[offset] = intensity
        colors[offset + 1] = intensity
        colors[offset + 2] = intensity
      }

      explodeAmountRef.current = Math.max(0, explodeAmt - delta * 1.5)
    } else {
      for (let index = 0; index < snapshot.count; index += 1) {
        const offset = index * 3
        let targetX = targets[offset]
        let targetY = targets[offset + 1]
        let targetZ = targets[offset + 2]

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

        if (hasSceneRotation) {
          const rotatedY = targetY * cosX - targetZ * sinX
          const rotatedZAfterX = targetY * sinX + targetZ * cosX
          const rotatedXAfterY = targetX * cosY + rotatedZAfterX * sinY
          const rotatedZAfterY = -targetX * sinY + rotatedZAfterX * cosY
          const rotatedX = rotatedXAfterY * cosZ - rotatedY * sinZ
          const rotatedYFinal = rotatedXAfterY * sinZ + rotatedY * cosZ

          targetX = rotatedX
          targetY = rotatedYFinal
          targetZ = rotatedZAfterY
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

        const intensity = Math.min(1, effectiveOpacity * (1 + snapshot.glowBoost * glow))
        colors[offset] = intensity
        colors[offset + 1] = intensity
        colors[offset + 2] = intensity
      }
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
        depthTest={false}
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
