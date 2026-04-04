import { memo, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { useAppStore } from '@/state/appStore'
import type { SceneSnapshot, StackSkillDatum } from './types'
import styles from './StackLabels.module.css'

type StackLabelsProps = {
  skills: StackSkillDatum[]
  snapshotRef: React.MutableRefObject<SceneSnapshot>
}

type ProjectedLabelProps = {
  skill: StackSkillDatum
  snapshotRef: React.MutableRefObject<SceneSnapshot>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const FADE_DURATION = 0.9    // s
const FADE_IN_DELAY = 1.8   // s
const FADE_OUT_DELAY = 0   // s
const LABEL_Z_INDEX_RANGE: [number, number] = [2, 0]
const LABEL_STYLE = { color: 'var(--color-light-secondary)' } as const

function ProjectedLabelComponent({ skill, snapshotRef }: ProjectedLabelProps) {
  const labelRef = useRef<HTMLSpanElement | null>(null)
  const smoothOpacityRef = useRef(0)
  const delayRef = useRef(0)
  const lastDirectionRef = useRef<'in' | 'out' | 'stable'>('stable')
  const camera = useThree((state) => state.camera)
  const projected = useMemo(() => new THREE.Vector3(), [])
  const anchor = useMemo(
    () => new THREE.Vector3(skill.labelAnchor[0], skill.labelAnchor[1], skill.labelAnchor[2]),
    [skill.labelAnchor],
  )

  useFrame((_, delta) => {
    const element = labelRef.current
    if (!element) {
      return
    }
    const visibility = snapshotRef.current.stackDisplayProgress

    projected.copy(anchor)
    const distance = projected.distanceTo(camera.position)
    projected.project(camera)

    let targetOpacity = 0
    if (
      projected.x >= -1.18 &&
      projected.x <= 1.18 &&
      projected.y >= -1.18 &&
      projected.y <= 1.18 &&
      projected.z <= 1
    ) {
      const depthScale = clamp(12 / distance, 0.34, 1.48)
      const fontSize = Math.max(8, Math.round(12 * depthScale * skill.labelScale))

      element.style.fontSize = `${fontSize}px`
      targetOpacity = Math.min(1, visibility)
    }

    const current = smoothOpacityRef.current
    const diff = targetOpacity - current

    if (Math.abs(diff) < 0.001) {
      smoothOpacityRef.current = targetOpacity
      lastDirectionRef.current = 'stable'
    } else {
      const direction = diff > 0 ? 'in' : 'out'

      if (direction !== lastDirectionRef.current) {
        lastDirectionRef.current = direction
        delayRef.current = direction === 'in' ? FADE_IN_DELAY : FADE_OUT_DELAY
      }

      if (delayRef.current > 0) {
        delayRef.current = Math.max(0, delayRef.current - delta)
      } else {
        const step = delta / FADE_DURATION
        smoothOpacityRef.current =
          diff > 0
            ? Math.min(targetOpacity, current + step)
            : Math.max(targetOpacity, current - step)
      }
    }

    element.style.opacity = smoothOpacityRef.current < 0.04 ? '0' : String(smoothOpacityRef.current)
  })

  return (
    <Html position={skill.labelAnchor} center transform={false} zIndexRange={LABEL_Z_INDEX_RANGE}>
      <span ref={labelRef} className={styles.label} style={LABEL_STYLE}>
        {skill.text}
      </span>
    </Html>
  )
}

const ProjectedLabel = memo(
  ProjectedLabelComponent,
  (previousProps, nextProps) =>
    previousProps.skill === nextProps.skill && previousProps.snapshotRef === nextProps.snapshotRef,
)

function StackLabelsComponent({ skills, snapshotRef }: StackLabelsProps) {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)

  if (menuOpen || activeSection !== 'stack') {
    return null
  }

  return (
    <group>
      {skills.map((skill) => (
        <ProjectedLabel key={skill.id} skill={skill} snapshotRef={snapshotRef} />
      ))}
    </group>
  )
}

export const StackLabels = memo(
  StackLabelsComponent,
  (previousProps, nextProps) =>
    previousProps.skills === nextProps.skills &&
    previousProps.snapshotRef === nextProps.snapshotRef,
)
