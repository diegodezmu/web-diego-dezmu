import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { sectionLabels, sectionOrder, siteContent } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './MenuOverlay.module.css'

type MenuOverlayProps = {
  activeLabel: string
  motion: 'enter' | 'exit'
}

export function MenuOverlay({ activeLabel, motion }: MenuOverlayProps) {
  const navigate = useNavigate()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusedElementRef = useRef<HTMLElement | null>(null)
  const shouldRestoreFocusRef = useRef(true)
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)
  const exitClass = motion === 'exit' ? styles.exitHidden : ''

  useLayoutEffect(() => {
    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      shouldRestoreFocusRef.current = true
      setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)

      if (shouldRestoreFocusRef.current) {
        const restoreFocus = () => {
          const restoreTarget =
            previousFocusedElementRef.current?.isConnected
              ? previousFocusedElementRef.current
              : document.querySelector<HTMLButtonElement>('button[aria-label="Open menu"]')

          restoreTarget?.focus({ preventScroll: true })
        }

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(restoreFocus)
        })
      }
    }
  }, [setMenuOpen])

  const closeMenu = () => {
    shouldRestoreFocusRef.current = true
    setMenuOpen(false)
  }

  return (
    <aside className={styles.overlay} aria-modal="true" role="dialog">
      <div className={styles.panel}>
        <button
          ref={closeButtonRef}
          className={`${styles.closeButton} ${motion === 'enter' ? styles.closeButtonEnter : styles.closeButtonExit}`}
          type="button"
          aria-label="Close menu"
          data-cursor="interactive"
          onClick={closeMenu}
        >
          <span className={styles.closeLine} />
          <span className={styles.closeLine} />
        </button>

        <nav className={`${styles.nav} ${exitClass}`.trim()} aria-label="Site menu">
          {sectionOrder.map((section) => {
            const label = sectionLabels[section]
            const isActive = label === activeLabel

            return (
              <button
                key={section}
                className={`${styles.linkButton} ${isActive ? styles.linkButtonActive : ''}`}
                type="button"
                data-cursor="interactive"
                onClick={() => {
                  shouldRestoreFocusRef.current = false
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
