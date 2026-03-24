import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useAppStore } from '@/state/appStore'
import type { StackLabelDatum } from './types'
import styles from './StackLabels.module.css'

type StackLabelsProps = {
  labels: StackLabelDatum[]
  spin: number
}

export function StackLabels({ labels, spin }: StackLabelsProps) {
  const groupRef = useRef<Group | null>(null)
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)
  const deviceTier = useAppStore((state) => state.capabilities.deviceTier)
  const reducedMotion = useAppStore((state) => state.capabilities.reducedMotion)
  const stackProgress = useAppStore((state) => state.stackProgress)

  useFrame((state) => {
    if (!groupRef.current) {
      return
    }

    const rotationWeight = Math.max(0, Math.min(1, (stackProgress - 0.34) / 0.44))
    groupRef.current.rotation.y = reducedMotion ? 0 : state.clock.elapsedTime * spin * rotationWeight
  })

  if (menuOpen || activeSection !== 'stack' || stackProgress < 0.42) {
    return null
  }

  if (deviceTier === 'mobile' || deviceTier === 'lowPower') {
    return null
  }

  return (
    <group ref={groupRef}>
      {labels.map((label) => (
        <Html
          key={label.id}
          position={label.position}
          center
          distanceFactor={9.4}
          transform={false}
          zIndexRange={[2, 0]}
        >
          <span className={styles.label}>{label.text}</span>
        </Html>
      ))}
    </group>
  )
}
