import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { sectionLabels, sectionOrder, siteContent } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './MenuOverlay.module.css'

type MenuOverlayProps = {
  activeLabel: string
  motion: 'enter' | 'exit'
}

export function MenuOverlay({ activeLabel, motion }: MenuOverlayProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([])
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)
  const exitClass = motion === 'exit' ? styles.exitHidden : ''

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.24, ease: 'power2.out' },
      )
      gsap.fromTo(
        itemsRef.current,
        { autoAlpha: 0, y: 56 },
        { autoAlpha: 1, y: 0, duration: 3, stagger: 0.06, ease: 'power2.out', delay: 0.08 },
      )
    }, panelRef)

    return () => ctx.revert()
  }, [])

  return (
    <aside className={styles.overlay} aria-modal="true" role="dialog">
      <div ref={panelRef} className={styles.panel}>
        <button
          ref={closeButtonRef}
          className={`${styles.closeButton} ${motion === 'enter' ? styles.closeButtonEnter : styles.closeButtonExit}`}
          type="button"
          aria-label="Close menu"
          data-cursor="interactive"
          onClick={() => setMenuOpen(false)}
        >
          <span className={styles.closeLine} />
          <span className={styles.closeLine} />
        </button>

        <nav className={`${styles.nav} ${exitClass}`.trim()} aria-label="Site menu">
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
                <span className={styles.linkLabel}>{label}</span>
              </button>
            )
          })}
        </nav>

        <p className={`${styles.caption} ${exitClass}`.trim()}>{siteContent.menuCaption}</p>
      </div>
    </aside>
  )
}
