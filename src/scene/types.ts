export type StackLabelDatum = {
  id: string
  text: string
  position: [number, number, number]
  group: string
  densityTier: number
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

export type StackSceneData = {
  points: Float32Array
  bridgePoints: Float32Array
  labels: StackLabelDatum[]
  connectionSegments: Float32Array
  floorSegments: Float32Array
  axisSegments: Float32Array
}
