import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { sectionLabels } from '@/config/content'
import { Header } from '@/features/layout/Header'
import { MenuOverlay } from '@/features/menu/MenuOverlay'
import { PaginationControls } from '@/features/navigation/PaginationControls'
import { AboutPage } from '@/features/pages/AboutPage'
import { ContactPage } from '@/features/pages/ContactPage'
import { HomePage } from '@/features/pages/HomePage'
import { StackPage } from '@/features/pages/StackPage'
import { SceneCanvas } from '@/scene/SceneCanvas'
import { CustomCursor } from '@/shared/components/CustomCursor'
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

const MENU_OVERLAY_MOTION_MS = 220
const CURSOR_INTERACTIVE_SELECTOR = [
  'button[data-cursor="interactive"]:not([disabled])',
  'a[data-cursor="interactive"][href]',
  '[role="button"][data-cursor="interactive"]:not([aria-disabled="true"])',
].join(', ')

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function AppShell() {
  const location = useLocation()
  const activeSection = useAppStore((state) => state.activeSection)
  const sceneMode = useAppStore((state) => state.sceneMode)
  const menuOpen = useAppStore((state) => state.menuOpen)
  const capabilities = useAppStore((state) => state.capabilities)
  const contactProgress = useAppStore((state) => state.contactProgress)
  const stackProgress = useAppStore((state) => state.stackProgress)
  const setActiveSection = useAppStore((state) => state.setActiveSection)
  const bumpContentRevealKey = useAppStore((state) => state.bumpContentRevealKey)
  const setCapabilities = useAppStore((state) => state.setCapabilities)
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)
  const setMenuOverlayActive = useAppStore((state) => state.setMenuOverlayActive)
  const setPointer = useAppStore((state) => state.setPointer)
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
  })

  useEffect(() => {
    syncCapabilities()
    window.addEventListener('resize', syncCapabilities)
    return () => window.removeEventListener('resize', syncCapabilities)
  }, [])

  useEffect(() => {
    return () => {
      if (overlayExitTimeoutRef.current !== null) {
        window.clearTimeout(overlayExitTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const section = pathToSection[location.pathname as keyof typeof pathToSection] ?? 'home'
    setActiveSection(section)
    setMenuOpen(false)
  }, [location.pathname, setActiveSection, setMenuOpen])

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
    if (capabilities.isTouch) {
      return
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [capabilities.isTouch])

  const fallbackMode = menuOpen ? 'menuGrid' : sceneMode
  const menuVisible = menuOpen || overlayMounted
  const showAboutUnderlay = !menuOpen && activeSection === 'about'
  const showContactUnderlay = !menuOpen && activeSection === 'contact'
  const aboutContentBelowScene = !menuOpen && activeSection === 'about'
  const aboutUnderlayOpacity = showAboutUnderlay ? 1 : 0
  const contactUnderlayOpacity = Math.min(1, 0.4 + contactProgress * 0.52)
  const stackFallbackBlend = clamp(stackProgress, 0, 1)

  useEffect(() => {
    if (previousMenuVisibleRef.current && !menuVisible) {
      bumpContentRevealKey()
    }

    previousMenuVisibleRef.current = menuVisible
  }, [bumpContentRevealKey, menuVisible])

  return (
    <div className={styles.shell} data-section={activeSection}>
      <div
        className={`${styles.sceneUnderlay} ${showAboutUnderlay ? styles.sceneUnderlayAbout : ''} ${showContactUnderlay ? styles.sceneUnderlayContact : ''}`}
        style={{
          opacity: showAboutUnderlay ? aboutUnderlayOpacity : showContactUnderlay ? contactUnderlayOpacity : 0,
        }}
        aria-hidden="true"
      />

      {capabilities.webglSupported ? (
        <SceneCanvas />
      ) : activeSection === 'stack' && !menuOpen ? (
        <>
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
        </>
      ) : (
        <div
          className={`${styles.fallbackBackdrop} ${styles[`fallbackBackdrop--${fallbackMode}`]}`}
          aria-hidden="true"
        />
      )}

      <div
        className={`${styles.contentLayer} ${aboutContentBelowScene ? styles.contentLayerBelowScene : ''} ${menuVisible ? styles.layerHidden : ''}`}
        aria-hidden={menuVisible}
      >
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/stack" element={<StackPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <div className={`${styles.chromeLayer} ${menuVisible ? styles.layerHidden : ''}`} aria-hidden={menuVisible}>
        <Header />
        <PaginationControls />
      </div>

      {menuVisible ? <MenuOverlay activeLabel={sectionLabels[activeSection]} motion={overlayMotion} /> : null}

      <CustomCursor />
    </div>
  )
}
