import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { StackLabels } from './StackLabels'
import type { SceneSnapshot, StackSceneData } from './types'

type StackLineSegmentsProps = {
  positions: Float32Array
  color: string
  snapshotRef: React.MutableRefObject<SceneSnapshot>
}

function StackLineSegments({ positions, color, snapshotRef }: StackLineSegmentsProps) {
  const materialRef = useRef<THREE.LineBasicMaterial | null>(null)

  useFrame(() => {
    const material = materialRef.current
    if (!material) {
      return
    }

    material.opacity = 0.14 * snapshotRef.current.stackDisplayProgress
  })

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
      <lineBasicMaterial ref={materialRef} color={color} opacity={0} transparent />
    </lineSegments>
  )
}

type StackEmbeddingMapProps = {
  active: boolean
  sceneData: StackSceneData | null
  snapshotRef: React.MutableRefObject<SceneSnapshot>
}

export function StackEmbeddingMap({ active, sceneData, snapshotRef }: StackEmbeddingMapProps) {
  if (!active || !sceneData) {
    return null
  }

  return (
    <>
      <StackLineSegments positions={sceneData.gridSegments} color="#d4d0c8" snapshotRef={snapshotRef} />
      <StackLabels skills={sceneData.skills} snapshotRef={snapshotRef} />
    </>
  )
}
