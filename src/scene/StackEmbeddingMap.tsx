import { StackLabels } from './StackLabels'
import type { StackSceneData } from './types'

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
  sceneData: StackSceneData | null
  visibility: number
}

export function StackEmbeddingMap({ active, sceneData, visibility }: StackEmbeddingMapProps) {
  if (!active || visibility <= 0.001 || !sceneData) {
    return null
  }

  return (
    <>
      <StackLineSegments positions={sceneData.gridSegments} color="#d4d0c8" opacity={0.14 * visibility} />
      <StackLabels skills={sceneData.skills} visibility={visibility} />
    </>
  )
}
