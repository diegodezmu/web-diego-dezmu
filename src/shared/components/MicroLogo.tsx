import { Link } from 'react-router-dom'
import { siteContent } from '@/config/content'
import styles from './MicroLogo.module.css'

type MicroLogoProps = {
  className?: string
}

export function MicroLogo({ className = '' }: MicroLogoProps) {
  return (
    <Link
      className={`${styles.logo} ${className}`.trim()}
      to="/"
      aria-label="Go to home"
      data-cursor="interactive"
    >
      {siteContent.microDisplayName}
    </Link>
  )
}
