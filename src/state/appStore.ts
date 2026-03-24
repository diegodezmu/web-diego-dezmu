import { create } from 'zustand'
import { sectionToSceneMode } from '@/config/scenePresets'
import type { AppSection, Capabilities, PointerState, SceneMode } from '@/shared/types'

type StackView = {
  panX: number
  panY: number
}

type AppState = {
  activeSection: AppSection
  sceneMode: SceneMode
  menuOpen: boolean
  pointer: PointerState
  capabilities: Capabilities
  aboutScrollProgress: number
  stackProgress: number
  contactProgress: number
  stackView: StackView
  setActiveSection: (section: AppSection) => void
  setMenuOpen: (open: boolean) => void
  setPointer: (pointer: Partial<PointerState>) => void
  setCapabilities: (capabilities: Partial<Capabilities>) => void
  setAboutScrollProgress: (progress: number) => void
  setStackProgress: (progress: number) => void
  setContactProgress: (progress: number) => void
  setStackView: (view: Partial<StackView>) => void
  resetStackView: () => void
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

const defaultStackView: StackView = {
  panX: 0,
  panY: 0,
}

export const useAppStore = create<AppState>((set) => ({
  activeSection: 'home',
  sceneMode: 'homeAlpha',
  menuOpen: false,
  pointer: defaultPointer,
  capabilities: defaultCapabilities,
  aboutScrollProgress: 0,
  stackProgress: 0,
  contactProgress: 0,
  stackView: defaultStackView,
  setActiveSection: (section) =>
    set({
      activeSection: section,
      sceneMode: sectionToSceneMode(section),
      aboutScrollProgress: 0,
      stackProgress: 0,
      contactProgress: 0,
      stackView: defaultStackView,
    }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
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
  setStackProgress: (stackProgress) => set({ stackProgress }),
  setContactProgress: (contactProgress) => set({ contactProgress }),
  setStackView: (view) =>
    set((state) => ({
      stackView: {
        ...state.stackView,
        ...view,
      },
    })),
  resetStackView: () => set({ stackView: defaultStackView }),
}))
