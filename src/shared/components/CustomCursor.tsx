import { useAppStore } from '@/state/appStore'
import styles from './CustomCursor.module.css'

export function CustomCursor() {
  const pointer = useAppStore((state) => state.pointer)
  const capabilities = useAppStore((state) => state.capabilities)

  if (capabilities.isTouch) {
    return null
  }

  return (
    <div
      className={`${styles.cursor} ${pointer.inside ? styles.cursorVisible : ''} ${pointer.interactive ? styles.cursorInteractive : ''}`}
      style={{
        left: `${((pointer.x + 1) * 0.5) * 100}%`,
        top: `${((1 - (pointer.y + 1) * 0.5) * 100).toFixed(4)}%`,
      }}
      aria-hidden="true"
    >
      <svg
        className={`${styles.cursorLayer} ${styles.cursorFrame}`}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.615234 15.3848H3.07715V16H0V12.9229H0.615234V15.3848ZM16 16H12.9229V15.3848H15.3848V12.9229H16V16ZM3.07715 0.615234H0.615234V3.07715H0V0H3.07715V0.615234ZM16 3.07715H15.3848V0.615234H12.9229V0H16V3.07715Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className={`${styles.cursorLayer} ${styles.cursorCenter}`}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="2.46191" fill="currentColor" />
      </svg>
    </div>
  )
}
