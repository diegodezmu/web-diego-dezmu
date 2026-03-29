import { create } from 'zustand'
import { sectionToSceneMode } from '@/config/scenePresets'
import type { AppSection, Capabilities, PointerState, SceneMode } from '@/shared/types'

export const DEFAULT_STACK_THETA = Math.PI * 0.21 + Math.PI * 0.55
export const DEFAULT_STACK_PHI = Math.PI * 0.44
export const DEFAULT_STACK_RADIUS = 16.7

type StackCameraState = {
  thetaTarget: number
  phiTarget: number
  hasInteracted: boolean
}

type AppState = {
  activeSection: AppSection
  sceneMode: SceneMode
  menuOpen: boolean
  menuOverlayActive: boolean
  introCompleted: boolean
  contentRevealKey: number
  pointer: PointerState
  capabilities: Capabilities
  holdStartTime: number | null
  explodeVersion: number
  explodeStrength: number
  aboutScrollProgress: number
  contactProgress: number
  stackStateTarget: 0 | 1
  stackProgress: number
  stackCamera: StackCameraState
  stackZoom: number
  startHold: () => void
  endHold: () => void
  completeIntro: () => void
  triggerExplode: (strength: number) => void
  setActiveSection: (section: AppSection) => void
  setSceneMode: (sceneMode: SceneMode) => void
  setMenuOpen: (open: boolean) => void
  setMenuOverlayActive: (active: boolean) => void
  bumpContentRevealKey: () => void
  setPointer: (pointer: Partial<PointerState>) => void
  setCapabilities: (capabilities: Partial<Capabilities>) => void
  setAboutScrollProgress: (progress: number) => void
  setContactProgress: (progress: number) => void
  setStackStateTarget: (target: 0 | 1) => void
  setStackProgress: (progress: number) => void
  setStackCamera: (camera: Partial<StackCameraState>) => void
  markStackCameraInteracted: () => void
  setStackZoom: (zoom: number) => void
}

const defaultPointer: PointerState = {
  x: 0,
  y: 0,
  inside: false,
  interactive: false,
}

const defaultCapabilities: Capabilities = {
  deviceTier: 'desktop',
  reducedMotion: false,
  webglSupported: true,
  isTouch: false,
}

const defaultStackCamera: StackCameraState = {
  thetaTarget: DEFAULT_STACK_THETA,
  phiTarget: DEFAULT_STACK_PHI,
  hasInteracted: false,
}

export const useAppStore = create<AppState>((set) => ({
  activeSection: 'home',
  sceneMode: 'homeAlpha',
  menuOpen: false,
  menuOverlayActive: false,
  introCompleted: false,
  contentRevealKey: 0,
  pointer: defaultPointer,
  capabilities: defaultCapabilities,
  holdStartTime: null,
  explodeVersion: 0,
  explodeStrength: 0,
  aboutScrollProgress: 0,
  contactProgress: 0,
  stackStateTarget: 0,
  stackProgress: 0,
  stackCamera: defaultStackCamera,
  stackZoom: 1,
  startHold: () => set({ holdStartTime: Date.now() }),
  endHold: () => set({ holdStartTime: null }),
  completeIntro: () => set({ introCompleted: true }),
  triggerExplode: (explodeStrength) =>
    set((state) => ({
      explodeStrength,
      explodeVersion: state.explodeVersion + 1,
    })),
  setActiveSection: (section) =>
    set({
      activeSection: section,
      sceneMode: sectionToSceneMode(section),
      aboutScrollProgress: 0,
      contactProgress: 0,
      stackStateTarget: 0,
      stackProgress: 0,
      stackCamera: defaultStackCamera,
      stackZoom: 1,
    }),
  setSceneMode: (sceneMode) => set({ sceneMode }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setMenuOverlayActive: (menuOverlayActive) => set({ menuOverlayActive }),
  bumpContentRevealKey: () => set((state) => ({ contentRevealKey: state.contentRevealKey + 1 })),
  setPointer: (pointer) =>
    set((state) => ({
      pointer: {
        ...state.pointer,
        ...pointer,
      },
    })),
  setCapabilities: (capabilities) =>
    set((state) => ({
      capabilities: {
        ...state.capabilities,
        ...capabilities,
      },
    })),
  setAboutScrollProgress: (aboutScrollProgress) => set({ aboutScrollProgress }),
  setContactProgress: (contactProgress) => set({ contactProgress }),
  setStackStateTarget: (stackStateTarget) => set({ stackStateTarget }),
  setStackProgress: (stackProgress) => set({ stackProgress }),
  setStackCamera: (camera) =>
    set((state) => ({
      stackCamera: {
        ...state.stackCamera,
        ...camera,
      },
    })),
  markStackCameraInteracted: () =>
    set((state) => ({
      stackCamera: {
        ...state.stackCamera,
        hasInteracted: true,
      },
    })),
  setStackZoom: (stackZoom) => set({ stackZoom }),
}))
