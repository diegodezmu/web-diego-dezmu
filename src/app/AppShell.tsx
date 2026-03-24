import { useEffect, useEffectEvent } from 'react'
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

export function AppShell() {
  const location = useLocation()
  const activeSection = useAppStore((state) => state.activeSection)
  const sceneMode = useAppStore((state) => state.sceneMode)
  const menuOpen = useAppStore((state) => state.menuOpen)
  const capabilities = useAppStore((state) => state.capabilities)
  const setActiveSection = useAppStore((state) => state.setActiveSection)
  const setCapabilities = useAppStore((state) => state.setCapabilities)
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)
  const setPointer = useAppStore((state) => state.setPointer)

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
    const section = pathToSection[location.pathname as keyof typeof pathToSection] ?? 'home'
    setActiveSection(section)
    setMenuOpen(false)
  }, [location.pathname, setActiveSection, setMenuOpen])

  const handlePointerMove = useEffectEvent((event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target : null
    setPointer({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -((event.clientY / window.innerHeight) * 2 - 1),
      inside: true,
      interactive: Boolean(target?.closest('[data-cursor="interactive"]')),
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

  return (
    <div className={styles.shell} data-section={activeSection}>
      {capabilities.webglSupported ? (
        <SceneCanvas />
      ) : (
        <div
          className={`${styles.fallbackBackdrop} ${styles[`fallbackBackdrop--${fallbackMode}`]}`}
          aria-hidden="true"
        />
      )}

      <div
        className={`${styles.routeLayer} ${menuOpen ? styles.routeLayerHidden : ''}`}
        aria-hidden={menuOpen}
      >
        <Header />
        <PaginationControls />

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

      {menuOpen ? <MenuOverlay activeLabel={sectionLabels[activeSection]} /> : null}

      <CustomCursor />
    </div>
  )
}
