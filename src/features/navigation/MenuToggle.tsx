import { useAppStore } from '@/state/appStore'
import styles from './MenuToggle.module.css'

export function MenuToggle() {
  const setMenuOpen = useAppStore((state) => state.setMenuOpen)

  return (
    <button
      className={styles.toggle}
      type="button"
      aria-label="Open menu"
      data-cursor="interactive"
      onClick={() => setMenuOpen(true)}
    >
      <span className={styles.labelWrap}>
        <span className={styles.labelLead}>M</span>
        <span className={styles.labelMask}>
          <span className={styles.labelTail}>ENU</span>
        </span>
      </span>
      <span className={styles.rule} aria-hidden="true" />
    </button>
  )
}
