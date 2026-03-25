import { Canvas } from '@react-three/fiber'
import { ParticleScene } from './ParticleScene'
import styles from './SceneCanvas.module.css'
import { useAppStore } from '@/state/appStore'

export function SceneCanvas() {
  const deviceTier = useAppStore((state) => state.capabilities.deviceTier)

  const dpr: [number, number] =
    deviceTier === 'desktop'
      ? [1, 1.85]
      : deviceTier === 'tablet'
        ? [1, 1.45]
        : deviceTier === 'mobile'
          ? [1, 1.2]
          : [1, 1.05]

  return (
    <div className={styles.canvasWrap} aria-hidden="true">
      <Canvas
        camera={{ fov: 34, near: 0.1, far: 50, position: [0, 0, 11.5] }}
        dpr={dpr}
        gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 1)
        }}
      >
        <ParticleScene />
      </Canvas>
    </div>
  )
}
