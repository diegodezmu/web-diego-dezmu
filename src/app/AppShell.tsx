import { Suspense, lazy, useDeferredValue, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { FallbackBackground } from '@/app/FallbackBackground'
import { IntroCurtain } from '@/app/IntroCurtain'
import { SceneErrorBoundary } from '@/app/SceneErrorBoundary'
import { PAGE_TITLE_EXIT_DURATION_MS } from '@/app/pageTransition'
import { INTRO_CURTAIN_ENABLED } from '@/config/appFlags'
import { sectionLabels } from '@/config/content'
import { EXPLODE_PRESETS } from '@/config/scenePresets'
import { Header } from '@/features/layout/Header'
import { MenuOverlay } from '@/features/menu/MenuOverlay'
import { PaginationControls } from '@/features/navigation/PaginationControls'
import { ContactPage } from '@/features/pages/ContactPage'
import { HomePage } from '@/features/pages/HomePage'
import { CustomCursor } from '@/shared/components/CustomCursor'
import type { AppSection } from '@/shared/types'
import { detectCapabilities } from '@/shared/utils/device'
import { supportsWebGL } from '@/shared/utils/webgl'
import { useAppStore } from '@/state/appStore'
import styles from './AppShell.module.css'

const pathToSection = {
  '/': 'home',
  '/about': 'about',
  '/stack': 'stack',
  '/contact': 'contact',
} as const

const MENU_OVERLAY_MOTION_MS = 900
const ABOUT_UNDERLAY_FADE_PROGRESS = 0.06
const CURSOR_INTERACTIVE_SELECTOR = [
  'button[data-cursor="interactive"]:not([disabled])',
  'a[data-cursor="interactive"][href]',
  '[role="button"][data-cursor="interactive"]:not([aria-disabled="true"])',
].join(', ')

const loadSceneCanvas = () =>
  import('@/scene/SceneCanvas').then((module) => ({ default: module.SceneCanvas }))
const loadAboutPage = () =>
  import('@/features/pages/AboutPage').then((module) => ({ default: module.AboutPage }))
const loadStackPage = () =>
  import('@/features/pages/StackPage').then((module) => ({ default: module.StackPage }))
const loadNotFoundPage = () =>
  import('@/features/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))

const SceneCanvas = lazy(() =>
  loadSceneCanvas(),
)
const AboutPage = lazy(() =>
  loadAboutPage(),
)
const StackPage = lazy(() =>
  loadStackPage(),
)
const NotFoundPage = lazy(() =>
  loadNotFoundPage(),
)

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function renderFallbackScene(
  fallbackMode: string,
  activeSection: AppSection,
  menuOpen: boolean,
  stackFallbackBlend: number,
) {
  if (activeSection === 'stack' && !menuOpen) {
    return (
      <FallbackBackground>
        <div
          className={`${styles.fallbackBackdrop} ${styles['fallbackBackdrop--stackGamma']}`}
          style={{ opacity: 1 - stackFallbackBlend * 0.76, transition: 'none' }}
          aria-hidden="true"
        />
        <div
          className={`${styles.fallbackBackdrop} ${styles['fallbackBackdrop--stackEmbeddingMap']}`}
          style={{ opacity: stackFallbackBlend, transition: 'none' }}
          aria-hidden="true"
        />
      </FallbackBackground>
    )
  }

  return (
    <FallbackBackground>
      <div
        className={`${styles.fallbackBackdrop} ${styles[`fallbackBackdrop--${fallbackMode}`]}`}
        aria-hidden="true"
      />
    </FallbackBackground>
  )
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const deferredLocation = useDeferredValue(location)
  const activeSection = useAppStore((state) => state.activeSection)
  const sceneMode = useAppStore((state) => state.sceneMode)
  const menuOpen = useAppStore((state) => state.menuOpen)
  const introCompleted = useAppStore((state) => state.introCompleted)
  const pageTransitionPhase = useAppStore((state) => state.pageTransitionPhase)
  const pageTransitionTarget = useAppStore((state) => state.pageTransitionTarget)
  const isTouch = useAppStore((state) => state.capabilities.isTouch)
  const webglSupported = useAppStore((state) => state.capabilities.webglSupported)
  const aboutScrollProgress = useAppStore((state) => state.aboutScrollProgress)
  const contactProgress = useAppStore((state) => state.contactProgress)
  const stackProgress = useAppStore((state) => state.stackProgress)
  const setActiveSection = useAppStore((state) => state.setActiveSection)
  const bumpContentRevealKey = useAppStore((state) => state.bumpContentRevealKey)
  const setCapabilities = useAppStore((state) => state.setCapabilities)
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)
  const setMenuOverlayActive = useAppStore((state) => state.setMenuOverlayActive)
  const setPointer = useAppStore((state) => state.setPointer)
  const startHold = useAppStore((state) => state.startHold)
  const endHold = useAppStore((state) => state.endHold)
  const completeIntro = useAppStore((state) => state.completeIntro)
  const startPageTransitionExit = useAppStore((state) => state.startPageTransitionExit)
  const completePageTransition = useAppStore((state) => state.completePageTransition)
  const triggerExplode = useAppStore((state) => state.triggerExplode)
  const [introFinished, setIntroFinished] = useState(!INTRO_CURTAIN_ENABLED)
  const [overlayMounted, setOverlayMounted] = useState(menuOpen)
  const [overlayMotion, setOverlayMotion] = useState<'enter' | 'exit'>('enter')
  const overlayExitTimeoutRef = useRef<number | null>(null)
  const previousMenuVisibleRef = useRef(menuOpen)

  const syncCapabilities = useEffectEvent(() => {
    const webglSupported = supportsWebGL()
    const detected = detectCapabilities()
    setCapabilities({
      ...detected,
      webglSupported,
    })

    document.documentElement.dataset.cursorMode = !detected.isTouch ? 'custom' : 'native'
    document.documentElement.dataset.reducedMotion = detected.reducedMotion
      ? 'reduce'
      : 'no-preference'
  })

  useEffect(() => {
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointerMedia = window.matchMedia('(pointer: coarse)')
    const handleCapabilityChange = () => {
      syncCapabilities()
    }
    const registerMediaListener = (query: MediaQueryList) => {
      if ('addEventListener' in query) {
        query.addEventListener('change', handleCapabilityChange)
        return () => query.removeEventListener('change', handleCapabilityChange)
      }

      const legacyQuery = query as MediaQueryList & {
        addListener: (listener: (event: MediaQueryListEvent) => void) => void
        removeListener: (listener: (event: MediaQueryListEvent) => void) => void
      }

      legacyQuery.addListener(handleCapabilityChange)
      return () => legacyQuery.removeListener(handleCapabilityChange)
    }
    const unregisterReducedMotion = registerMediaListener(reducedMotionMedia)
    const unregisterCoarsePointer = registerMediaListener(coarsePointerMedia)

    syncCapabilities()
    window.addEventListener('resize', syncCapabilities)
    return () => {
      unregisterReducedMotion()
      unregisterCoarsePointer()
      window.removeEventListener('resize', syncCapabilities)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (overlayExitTimeoutRef.current !== null) {
        window.clearTimeout(overlayExitTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let idleCallbackId: number | null = null
    let timeoutId: number | null = null
    const requestIdleCallback =
      'requestIdleCallback' in window ? window.requestIdleCallback.bind(window) : null
    const cancelIdleCallback =
      'cancelIdleCallback' in window ? window.cancelIdleCallback.bind(window) : null
    const preloadLazyPages = () => {
      void loadAboutPage()
      void loadStackPage()
      void loadNotFoundPage()
    }

    if (requestIdleCallback) {
      idleCallbackId = requestIdleCallback(preloadLazyPages, { timeout: 1500 })
    } else {
      timeoutId = window.setTimeout(preloadLazyPages, 300)
    }

    return () => {
      if (idleCallbackId !== null && cancelIdleCallback) {
        cancelIdleCallback(idleCallbackId)
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  useEffect(() => {
    if (introCompleted) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      completeIntro()
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [completeIntro, introCompleted])

  useLayoutEffect(() => {
    const section = pathToSection[location.pathname as keyof typeof pathToSection] ?? 'home'
    const { introCompleted } = useAppStore.getState()
    const preset = EXPLODE_PRESETS[section]
    const isIntro = section === 'home' && !introCompleted
    const strength = preset
      ? isIntro
        ? (preset.introStrength ?? preset.strength)
        : preset.strength
      : 0

    setActiveSection(section)
    triggerExplode(strength)
    setMenuOpen(false)
  }, [location.pathname, setActiveSection, setMenuOpen, triggerExplode])

  useEffect(() => {
    let animationFrame = 0

    if (overlayExitTimeoutRef.current !== null) {
      window.clearTimeout(overlayExitTimeoutRef.current)
      overlayExitTimeoutRef.current = null
    }

    if (menuOpen) {
      animationFrame = window.requestAnimationFrame(() => {
        setOverlayMounted(true)
        setMenuOverlayActive(true)
        setOverlayMotion('enter')
      })
    } else if (overlayMounted) {
      animationFrame = window.requestAnimationFrame(() => {
        setOverlayMotion('exit')
      })
      overlayExitTimeoutRef.current = window.setTimeout(() => {
        setOverlayMounted(false)
        setMenuOverlayActive(false)
        overlayExitTimeoutRef.current = null
      }, MENU_OVERLAY_MOTION_MS)
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [menuOpen, overlayMounted, setMenuOverlayActive])

  const handlePointerMove = useEffectEvent((event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target : null
    setPointer({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -((event.clientY / window.innerHeight) * 2 - 1),
      inside: true,
      interactive: Boolean(target?.closest(CURSOR_INTERACTIVE_SELECTOR)),
    })
  })

  const handlePointerLeave = useEffectEvent(() => {
    setPointer({ inside: false, interactive: false })
  })

  useEffect(() => {
    if (isTouch) {
      return
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [isTouch])

  const fallbackMode = menuOpen ? 'menuGrid' : sceneMode
  const menuVisible = menuOpen || overlayMounted
  const renderedSection =
    pathToSection[deferredLocation.pathname as keyof typeof pathToSection] ?? activeSection
  const underlaySection =
    !menuOpen && pageTransitionTarget
      ? (pathToSection[pageTransitionTarget as keyof typeof pathToSection] ?? activeSection)
      : activeSection
  const showAboutUnderlay =
    !menuOpen && (underlaySection === 'about' || renderedSection === 'about')
  const targetContactUnderlayOpacity =
    !menuOpen && underlaySection === 'contact' ? Math.min(1, 0.4 + contactProgress * 0.52) : 0
  const renderedContactUnderlayOpacity =
    !menuOpen && renderedSection === 'contact' ? Math.min(1, 0.4 + contactProgress * 0.52) : 0
  const aboutUnderlayOpacity = showAboutUnderlay
    ? 1 - clamp(aboutScrollProgress / ABOUT_UNDERLAY_FADE_PROGRESS, 0, 1)
    : 0
  const contactUnderlayOpacity = Math.max(
    targetContactUnderlayOpacity,
    renderedContactUnderlayOpacity,
  )
  const stackFallbackBlend = clamp(stackProgress, 0, 1)
  const sceneFallback = renderFallbackScene(
    fallbackMode,
    activeSection,
    menuOpen,
    stackFallbackBlend,
  )

  useEffect(() => {
    if (previousMenuVisibleRef.current && !menuVisible) {
      const { pageTransitionTarget, pageTransitionPhase } = useAppStore.getState()

      if (pageTransitionTarget && pageTransitionPhase === 'idle') {
        startPageTransitionExit()
      } else {
        bumpContentRevealKey()
      }
    }

    previousMenuVisibleRef.current = menuVisible
  }, [bumpContentRevealKey, menuVisible, startPageTransitionExit])

  useEffect(() => {
    if (pageTransitionPhase !== 'exiting' || !pageTransitionTarget) {
      return
    }

    let completionFrame = 0
    const timeoutId = window.setTimeout(() => {
      navigate(pageTransitionTarget)
      completionFrame = window.requestAnimationFrame(() => {
        completePageTransition()
      })
    }, PAGE_TITLE_EXIT_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(completionFrame)
    }
  }, [completePageTransition, navigate, pageTransitionPhase, pageTransitionTarget])

  return (
    <div
      className={styles.shell}
      data-section={activeSection}
      onPointerDown={() => {
        if (!isTouch) {
          startHold()
        }
      }}
      onPointerUp={() => {
        endHold()
      }}
      onPointerLeave={() => {
        endHold()
      }}
    >
      <div
        className={`${styles.sceneUnderlay} ${styles.sceneUnderlayAbout}`}
        style={{ opacity: aboutUnderlayOpacity }}
        aria-hidden="true"
      />
      <div
        className={`${styles.sceneUnderlay} ${styles.sceneUnderlayContact}`}
        style={{ opacity: contactUnderlayOpacity }}
        aria-hidden="true"
      />

      {webglSupported ? (
        <SceneErrorBoundary fallback={sceneFallback}>
          <Suspense fallback={sceneFallback}>
            <SceneCanvas />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        sceneFallback
      )}

      <div
        className={`${styles.contentLayer} ${menuVisible ? styles.layerHidden : ''}`}
        aria-hidden={menuVisible}
      >
        <main className={styles.main}>
          <Suspense fallback={null}>
            <Routes location={deferredLocation}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/stack" element={<StackPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      <div className={`${styles.chromeLayer} ${menuVisible ? styles.layerHidden : ''}`} aria-hidden={menuVisible}>
        <Header />
        <PaginationControls key={activeSection} />
      </div>

      {menuVisible ? <MenuOverlay activeLabel={sectionLabels[activeSection]} motion={overlayMotion} /> : null}

      <CustomCursor />
      {INTRO_CURTAIN_ENABLED && !introFinished ? (
        <IntroCurtain onFinished={() => setIntroFinished(true)} />
      ) : null}
    </div>
  )
}
