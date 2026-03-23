export type AppSection = 'home' | 'about' | 'stack' | 'contact'

export type SceneMode =
  | 'logo'
  | 'aboutCurve'
  | 'aboutFrame'
  | 'stackCloud'
  | 'contactCurve'
  | 'menuFlood'

export type DeviceTier = 'desktop' | 'tablet' | 'mobile' | 'lowPower'

export type PointerState = {
  x: number
  y: number
  inside: boolean
  interactive: boolean
}

export type Capabilities = {
  deviceTier: DeviceTier
  reducedMotion: boolean
  webglSupported: boolean
  isTouch: boolean
}

export type CurveDefinition = {
  freqX: number
  freqY: number
  ampX: number
  ampY: number
  phase: number
  crossModAmount: number
  foldAmount: number
  ringModFreq: number
  speed: number
  animate: boolean
}

export type StackCluster = {
  name: string
  slug: string
  weight: number
  colorHint: string
  skills: string[]
}

export type ScenePreset = {
  count: number
  size: number
  opacity: number
  jitter: number
  orbit: number
  drift: number
  recovery: number
  pointerRadiusPx: number
  pointerStrength: number
  cameraPosition: readonly [number, number, number]
  cameraLookAt: readonly [number, number, number]
  spread: readonly [number, number, number]
}
