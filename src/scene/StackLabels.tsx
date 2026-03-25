import { Html } from '@react-three/drei'
import { useAppStore } from '@/state/appStore'
import type { StackLabelDatum } from './types'
import styles from './StackLabels.module.css'

type StackLabelsProps = {
  labels: StackLabelDatum[]
  visibility: number
}

export function StackLabels({ labels, visibility }: StackLabelsProps) {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)
  const deviceTier = useAppStore((state) => state.capabilities.deviceTier)

  if (menuOpen || activeSection !== 'stack' || visibility <= 0.02) {
    return null
  }

  if (deviceTier === 'mobile' || deviceTier === 'lowPower') {
    return null
  }

  return (
    <group>
      {labels.map((label) => (
        <Html
          key={label.id}
          position={label.position}
          center
          distanceFactor={10.2}
          transform={false}
          zIndexRange={[2, 0]}
        >
          <span
            className={styles.label}
            style={{
              fontSize: `${10 + label.densityTier * 1.05}px`,
              opacity: Math.min(1, visibility * (0.44 + label.densityTier * 0.12)),
            }}
          >
            {label.text}
          </span>
        </Html>
      ))}
    </group>
  )
}
