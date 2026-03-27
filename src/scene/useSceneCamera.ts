import { useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { SceneSnapshot } from './types'

export function useSceneCamera(snapshotRef: MutableRefObject<SceneSnapshot>) {
  useFrame((state) => {
    const snapshot = snapshotRef.current
    const cameraEase = 0.1

    state.camera.position.x += (snapshot.cameraPosition[0] - state.camera.position.x) * cameraEase
    state.camera.position.y += (snapshot.cameraPosition[1] - state.camera.position.y) * cameraEase
    state.camera.position.z += (snapshot.cameraPosition[2] - state.camera.position.z) * cameraEase
    state.camera.lookAt(
      snapshot.cameraLookAt[0],
      snapshot.cameraLookAt[1],
      snapshot.cameraLookAt[2],
    )
  })
}
