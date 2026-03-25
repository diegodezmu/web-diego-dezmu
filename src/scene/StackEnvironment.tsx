import { useAppStore } from '@/state/appStore'

type StackLinesProps = {
  positions: Float32Array
  color: string
  opacity: number
}

function StackLines({ positions, color, opacity }: StackLinesProps) {
  if (opacity <= 0.001) {
    return null
  }

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

type StackEnvironmentProps = {
  connectionSegments: Float32Array
  floorSegments: Float32Array
  axisSegments: Float32Array
  bridgeVisibility: number
  embeddingVisibility: number
}

export function StackEnvironment({
  connectionSegments,
  floorSegments,
  axisSegments,
  bridgeVisibility,
  embeddingVisibility,
}: StackEnvironmentProps) {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)
  const deviceTier = useAppStore((state) => state.capabilities.deviceTier)

  if (menuOpen || activeSection !== 'stack' || deviceTier === 'lowPower') {
    return null
  }

  const showSurface = deviceTier === 'desktop' || deviceTier === 'tablet'

  return (
    <group renderOrder={1}>
      <StackLines
        positions={connectionSegments}
        color="#8a8a8a"
        opacity={0.08 + bridgeVisibility * 0.28}
      />
      {showSurface ? (
        <StackLines
          positions={floorSegments}
          color="#2f2f2f"
          opacity={0.06 + embeddingVisibility * 0.22}
        />
      ) : null}
      {showSurface ? (
        <StackLines
          positions={axisSegments}
          color="#d1d1d1"
          opacity={0.12 + embeddingVisibility * 0.26}
        />
      ) : null}
    </group>
  )
}
