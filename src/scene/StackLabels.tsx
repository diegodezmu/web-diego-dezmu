import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { stackGroupPalette } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import type { StackSkillDatum } from './types'
import styles from './StackLabels.module.css'

type StackLabelsProps = {
  skills: StackSkillDatum[]
  visibility: number
}

type ProjectedLabelProps = {
  skill: StackSkillDatum
  visibility: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function ProjectedLabel({ skill, visibility }: ProjectedLabelProps) {
  const labelRef = useRef<HTMLSpanElement | null>(null)
  const camera = useThree((state) => state.camera)
  const projected = useMemo(() => new THREE.Vector3(), [])
  const anchor = useMemo(
    () => new THREE.Vector3(skill.labelAnchor[0], skill.labelAnchor[1], skill.labelAnchor[2]),
    [skill.labelAnchor],
  )

  useFrame(() => {
    const element = labelRef.current
    if (!element) {
      return
    }

    projected.copy(anchor)
    const distance = projected.distanceTo(camera.position)
    projected.project(camera)

    if (
      projected.x < -1.18 ||
      projected.x > 1.18 ||
      projected.y < -1.18 ||
      projected.y > 1.18 ||
      projected.z > 1
    ) {
      element.style.opacity = '0'
      return
    }

    const depthScale = clamp(12 / distance, 0.34, 1.48)
    const fontSize = Math.max(7, Math.round(12 * depthScale * skill.labelScale))
    const opacity = Math.min(1, depthScale * 0.76 * visibility)

    element.style.fontSize = `${fontSize}px`
    element.style.opacity = opacity < 0.1 ? '0' : String(opacity)
  })

  return (
    <Html position={skill.labelAnchor} center transform={false} zIndexRange={[2, 0]}>
      <span
        ref={labelRef}
        className={styles.label}
        style={{ color: stackGroupPalette[skill.group] }}
      >
        {skill.text}
      </span>
    </Html>
  )
}

export function StackLabels({ skills, visibility }: StackLabelsProps) {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)

  if (menuOpen || activeSection !== 'stack' || visibility <= 0.02) {
    return null
  }

  return (
    <group>
      {skills.map((skill) => (
        <ProjectedLabel key={skill.id} skill={skill} visibility={visibility} />
      ))}
    </group>
  )
}
