import { Html } from '@react-three/drei'
import { useAppStore } from '@/state/appStore'
import type { StackLabelDatum } from './types'
import styles from './StackLabels.module.css'

type StackLabelsProps = {
  labels: StackLabelDatum[]
}

export function StackLabels({ labels }: StackLabelsProps) {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)
  const deviceTier = useAppStore((state) => state.capabilities.deviceTier)
  const zoom = useAppStore((state) => state.stackView.zoom)

  if (menuOpen || activeSection !== 'stack') {
    return null
  }

  const showSkillLabels = deviceTier === 'desktop' || deviceTier === 'tablet' || zoom > 0.18

  if (!showSkillLabels) {
    return null
  }

  return (
    <>
      {labels.map((label) => (
        <Html
          key={label.id}
          position={label.position}
          center
          distanceFactor={10}
          transform={false}
          zIndexRange={[2, 0]}
        >
          <span className={styles.label}>{label.text}</span>
        </Html>
      ))}
    </>
  )
}
