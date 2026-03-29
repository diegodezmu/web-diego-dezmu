import { useAppStore } from '@/state/appStore'
import styles from './MenuToggle.module.css'

export function MenuToggle() {
  const activeSection = useAppStore((state) => state.activeSection)
  const introCompleted = useAppStore((state) => state.introCompleted)
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)
  const shouldDelayHomeIntro = activeSection === 'home' && !introCompleted

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
