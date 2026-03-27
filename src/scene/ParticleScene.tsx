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
        baseColors={scene.particleColors}
      />
      <StackEmbeddingMap
        active={scene.isStackMode}
        sceneData={scene.isStackMode && scene.stackProgress > 0.001 ? scene.stackResources.sceneData : null}
        visibility={scene.stackProgress}
      />
    </>
  )
}
