import { ParticleField } from './ParticleField'
import { StackEmbeddingMap } from './StackEmbeddingMap'
import { useSceneCamera } from './useSceneCamera'
import { useSceneSnapshot } from './useSceneSnapshot'

export function ParticleScene() {
  const scene = useSceneSnapshot()

  useSceneCamera(scene.snapshotRef)

  return (
    <>
      <ParticleField
        key={scene.maxCount}
        maxCount={scene.maxCount}
        snapshotRef={scene.snapshotRef}
      />
      <StackEmbeddingMap
        active={scene.isStackMode}
        sceneData={scene.isStackMode ? scene.stackResources.sceneData : null}
        snapshotRef={scene.snapshotRef}
      />
    </>
  )
}
