import { Link } from 'react-router-dom'
import { siteContent } from '@/config/content'
import styles from './MicroLogo.module.css'

type MicroLogoProps = {
  className?: string
  animate?: boolean
}

export function MicroLogo({ className = '', animate = false }: MicroLogoProps) {
  return (
    <Link
      className={`${styles.logo} ${animate ? styles.logoAnimate : ''} ${className}`.trim()}
      to="/"
      aria-label="Go to home"
      data-cursor="interactive"
    >
      {siteContent.microDisplayName}
    </Link>
  )
}
