import { Link } from 'react-router-dom'
import { siteContent } from '@/config/content'
import styles from './MicroLogo.module.css'

type MicroLogoProps = {
  className?: string
  motion?: 'static' | 'enter' | 'exit'
}

export function MicroLogo({ className = '', motion = 'static' }: MicroLogoProps) {
  const motionClass =
    motion === 'enter'
      ? styles.logoMotionEnter
      : motion === 'exit'
        ? styles.logoMotionExit
        : ''

  return (
    <Link
      className={`${styles.logo} ${motionClass} ${className}`.trim()}
      to="/"
      aria-label="Go to home"
      data-cursor="interactive"
    >
      {siteContent.microDisplayName}
    </Link>
  )
}
