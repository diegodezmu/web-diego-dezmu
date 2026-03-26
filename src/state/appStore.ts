import { create } from 'zustand'
import { sectionToSceneMode } from '@/config/scenePresets'
import type { AppSection, Capabilities, PointerState, SceneMode } from '@/shared/types'

export const DEFAULT_STACK_THETA = Math.PI * 0.5
export const DEFAULT_STACK_PHI = Math.PI * 0.5
export const DEFAULT_STACK_RADIUS = 25

type StackCameraState = {
  thetaTarget: number
  phiTarget: number
  radiusTarget: number
  hasInteracted: boolean
  resetNonce: number
}

type AppState = {
  activeSection: AppSection
  sceneMode: SceneMode
  menuOpen: boolean
  contentRevealKey: number
  pointer: PointerState
  capabilities: Capabilities
  aboutScrollProgress: number
  contactProgress: number
  stackCamera: StackCameraState
  setActiveSection: (section: AppSection) => void
  setSceneMode: (sceneMode: SceneMode) => void
  setMenuOpen: (open: boolean) => void
  bumpContentRevealKey: () => void
  setPointer: (pointer: Partial<PointerState>) => void
  setCapabilities: (capabilities: Partial<Capabilities>) => void
  setAboutScrollProgress: (progress: number) => void
  setContactProgress: (progress: number) => void
  setStackCamera: (camera: Partial<StackCameraState>) => void
  markStackCameraInteracted: () => void
  resetStackCamera: () => void
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
  radiusTarget: DEFAULT_STACK_RADIUS,
  hasInteracted: false,
  resetNonce: 0,
}

export const useAppStore = create<AppState>((set) => ({
  activeSection: 'home',
  sceneMode: 'homeAlpha',
  menuOpen: false,
  contentRevealKey: 0,
  pointer: defaultPointer,
  capabilities: defaultCapabilities,
  aboutScrollProgress: 0,
  contactProgress: 0,
  stackCamera: defaultStackCamera,
  setActiveSection: (section) =>
    set({
      activeSection: section,
      sceneMode: sectionToSceneMode(section),
      aboutScrollProgress: 0,
      contactProgress: 0,
      stackCamera: defaultStackCamera,
    }),
  setSceneMode: (sceneMode) => set({ sceneMode }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
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
  resetStackCamera: () =>
    set((state) => ({
      stackCamera: {
        ...defaultStackCamera,
        hasInteracted: state.stackCamera.hasInteracted,
        resetNonce: state.stackCamera.resetNonce + 1,
      },
    })),
}))
