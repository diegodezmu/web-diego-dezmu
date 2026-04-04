import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageTransitionNavigation } from '@/app/usePageTransitionNavigation'
import { useAppStore } from '@/state/appStore'
import styles from './MicroLogo.module.css'

type MicroLogoProps = {
  className?: string
  motion?: 'static' | 'enter' | 'exit'
}

export function MicroLogo({ className = '', motion = 'static' }: MicroLogoProps) {
  const location = useLocation()
  const navigateWithTransition = usePageTransitionNavigation()
  const mountedDuringIntroRef = useRef(!useAppStore.getState().introCompleted)
  const isHome = location.pathname === '/'
  const shouldDelayHomeIntro = motion === 'enter' && isHome && mountedDuringIntroRef.current
  const motionClass =
    motion === 'enter'
      ? styles.logoMotionEnter
      : motion === 'exit'
        ? styles.logoMotionExit
        : ''

  return (
    <button
      className={`${styles.logo} ${motionClass} ${shouldDelayHomeIntro ? styles.logoHomeIntro : ''} ${className}`.trim()}
      type="button"
      aria-label="Go to home"
      data-cursor="interactive"
      onClick={() => {
        if (!isHome) {
          navigateWithTransition('/')
        }
      }}
    >
      <span className={styles.letter} aria-hidden="true">
        D
      </span>
    </button>
  )
}
