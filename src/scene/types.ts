export type StackLabelDatum = {
  id: string
  text: string
  position: [number, number, number]
  clusterSlug: string
}

export type SceneSnapshot = {
  count: number
  targets: Float32Array
  blendTargets: Float32Array | null
  blend: number
  sizePx: number
  opacity: number
  orbit: number
  drift: number
  recovery: number
  pointerRadiusPx: number
  pointerStrength: number
  is3D: boolean
  cameraPosition: [number, number, number]
  cameraLookAt: [number, number, number]
}
