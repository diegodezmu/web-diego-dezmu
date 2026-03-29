import { useRef } from 'react'
import { useAppStore } from '@/state/appStore'
import styles from './MenuToggle.module.css'

export function MenuToggle() {
  const activeSection = useAppStore((state) => state.activeSection)
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)
  const mountedDuringIntroRef = useRef(!useAppStore.getState().introCompleted)
  const shouldDelayHomeIntro = activeSection === 'home' && mountedDuringIntroRef.current

  return (
    <button
      className={`${styles.toggle} ${shouldDelayHomeIntro ? styles.toggleHomeIntro : ''}`.trim()}
      type="button"
      aria-label="Open menu"
      data-cursor="interactive"
      onClick={() => setMenuOpen(true)}
    >
      <span className={styles.word} aria-hidden="true">
        M
      </span>
    </button>
  )
}
