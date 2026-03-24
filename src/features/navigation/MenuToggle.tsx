import type { CSSProperties } from 'react'
import { useAppStore } from '@/state/appStore'
import styles from './MenuToggle.module.css'

const tailLetters = ['E', 'N', 'U']

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
      <span className={styles.word} aria-hidden="true">
        <span className={styles.lead}>M</span>
        <span className={styles.tail}>
          {tailLetters.map((letter, index) => (
            <span
              key={letter}
              className={styles.char}
              style={{ '--char-delay': `${index * 55}ms` } as CSSProperties}
            >
              {letter}
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}
