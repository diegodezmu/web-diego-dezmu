import { useEffect, useRef, useState } from 'react'
import { MenuToggle } from '@/features/navigation/MenuToggle'
import { MicroLogo } from '@/shared/components/MicroLogo'
import { useAppStore } from '@/state/appStore'
import styles from './Header.module.css'

const ABOUT_LOGO_MOTION_MS = 1500

export function Header() {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)
  const shouldShowLogo = !menuOpen && activeSection !== 'home'
  const aboutLogoVisible = shouldShowLogo && activeSection === 'about'
  const [logoMounted, setLogoMounted] = useState(shouldShowLogo)
  const [logoRenderKey, setLogoRenderKey] = useState(0)
  const [logoMotion, setLogoMotion] = useState<'static' | 'enter' | 'exit'>(
    aboutLogoVisible ? 'enter' : 'static',
  )
  const previousAboutLogoVisibleRef = useRef(aboutLogoVisible)
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
    const wasAboutLogoVisible = previousAboutLogoVisibleRef.current

    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }

    if (shouldShowLogo) {
      animationFrame = window.requestAnimationFrame(() => {
        setLogoMounted(true)
        if (aboutLogoVisible) {
          if (!wasAboutLogoVisible) {
            setLogoRenderKey((currentKey) => currentKey + 1)
          }
          setLogoMotion('enter')
          return
        }

        if (wasAboutLogoVisible) {
          setLogoRenderKey((currentKey) => currentKey + 1)
        }

        setLogoMotion('static')
      })
    } else if (wasAboutLogoVisible) {
      animationFrame = window.requestAnimationFrame(() => {
        setLogoMounted(true)
        setLogoRenderKey((currentKey) => currentKey + 1)
        setLogoMotion('exit')
      })
      exitTimeoutRef.current = window.setTimeout(() => {
        setLogoMounted(false)
        setLogoMotion('static')
        exitTimeoutRef.current = null
      }, ABOUT_LOGO_MOTION_MS)
    } else {
      animationFrame = window.requestAnimationFrame(() => {
        setLogoMounted(false)
        setLogoMotion('static')
      })
    }

    previousAboutLogoVisibleRef.current = aboutLogoVisible

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [aboutLogoVisible, shouldShowLogo])

  return (
    <header className={styles.header}>
      <div className={styles.leading}>
        {logoMounted ? <MicroLogo key={logoRenderKey} motion={logoMotion} /> : null}
      </div>

      {!menuOpen ? <MenuToggle key={activeSection} /> : null}
    </header>
  )
}
