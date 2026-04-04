import { useEffect, useRef, useState } from 'react'
import { MenuToggle } from '@/features/navigation/MenuToggle'
import { MicroLogo } from '@/shared/components/MicroLogo'
import type { AppSection } from '@/shared/types'
import { useAppStore } from '@/state/appStore'
import styles from './Header.module.css'

const HEADER_LOGO_MOTION_MS = 1500

function sectionToPath(section: AppSection) {
  return section === 'home' ? '/' : `/${section}`
}

export function Header() {
  const menuOverlayActive = useAppStore((state) => state.menuOverlayActive)
  const activeSection = useAppStore((state) => state.activeSection)
  const pageTransitionPhase = useAppStore((state) => state.pageTransitionPhase)
  const pageTransitionOrigin = useAppStore((state) => state.pageTransitionOrigin)
  const pageTransitionTarget = useAppStore((state) => state.pageTransitionTarget)
  const isTransitioningHome =
    pageTransitionPhase === 'exiting' &&
    pageTransitionTarget === '/' &&
    pageTransitionOrigin === sectionToPath(activeSection)
  const shouldShowLogo = !menuOverlayActive && activeSection !== 'home' && !isTransitioningHome
  const [logoMounted, setLogoMounted] = useState(shouldShowLogo)
  const [logoRenderKey, setLogoRenderKey] = useState(0)
  const [logoMotion, setLogoMotion] = useState<'static' | 'enter' | 'exit'>(
    shouldShowLogo ? 'enter' : 'static',
  )
  const previousLogoVisibleRef = useRef(shouldShowLogo)
  const exitTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let animationFrame = 0
    const wasLogoVisible = previousLogoVisibleRef.current

    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }

    if (shouldShowLogo) {
      animationFrame = window.requestAnimationFrame(() => {
        setLogoMounted(true)
        if (!wasLogoVisible) {
          setLogoRenderKey((currentKey) => currentKey + 1)
          setLogoMotion('enter')
        } else {
          setLogoMotion('static')
        }
      })
    } else if (wasLogoVisible) {
      animationFrame = window.requestAnimationFrame(() => {
        setLogoMounted(true)
        setLogoRenderKey((currentKey) => currentKey + 1)
        setLogoMotion('exit')
      })
      exitTimeoutRef.current = window.setTimeout(() => {
        setLogoMounted(false)
        setLogoMotion('static')
        exitTimeoutRef.current = null
      }, HEADER_LOGO_MOTION_MS)
    } else {
      animationFrame = window.requestAnimationFrame(() => {
        setLogoMounted(false)
        setLogoMotion('static')
      })
    }

    previousLogoVisibleRef.current = shouldShowLogo

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [shouldShowLogo])

  return (
    <header className={styles.header}>
      <div className={styles.leading}>
        {logoMounted ? <MicroLogo key={logoRenderKey} motion={logoMotion} /> : null}
      </div>

      {!menuOverlayActive ? <MenuToggle /> : null}
    </header>
  )
}
