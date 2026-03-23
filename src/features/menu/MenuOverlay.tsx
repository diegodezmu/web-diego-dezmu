import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { sectionLabels, sectionOrder } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './MenuOverlay.module.css'

type MenuOverlayProps = {
  activeLabel: string
}

export function MenuOverlay({ activeLabel }: MenuOverlayProps) {
  const navigate = useNavigate()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([])
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.32, ease: 'power2.out' },
      )
      gsap.fromTo(
        closeButtonRef.current,
        { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out', delay: 0.08 },
      )
      gsap.fromTo(
        itemsRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out', stagger: 0.05, delay: 0.12 },
      )
    }, panelRef)

    return () => ctx.revert()
  }, [])

  return (
    <aside className={styles.overlay} aria-modal="true" role="dialog">
      <div ref={panelRef} className={styles.panel}>
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          aria-label="Close menu"
          data-cursor="interactive"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>

        <nav className={styles.nav} aria-label="Site menu">
          {sectionOrder.map((section, index) => {
            const label = sectionLabels[section]
            const isActive = label === activeLabel

            return (
              <button
                key={section}
                ref={(node) => {
                  itemsRef.current[index] = node
                }}
                className={`${styles.linkButton} ${isActive ? styles.linkButtonActive : ''}`}
                type="button"
                data-cursor="interactive"
                onClick={() => {
                  navigate(section === 'home' ? '/' : `/${section}`)
                  setMenuOpen(false)
                }}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
