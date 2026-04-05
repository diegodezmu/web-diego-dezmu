import type { ReactNode } from 'react'
import { assets } from '@/shared/assets'
import styles from './FallbackBackground.module.css'

type FallbackBackgroundProps = {
  children?: ReactNode
}

export function FallbackBackground({ children }: FallbackBackgroundProps) {
  return (
    <div className={styles.root} aria-hidden="true">
      <picture className={styles.picture}>
        <source media="(min-width: 1600px)" srcSet={assets.fallbackDesktopFullHdUrl} />
        <source media="(min-width: 1201px)" srcSet={assets.fallbackDesktopUrl} />
        <source media="(min-width: 768px)" srcSet={assets.fallbackTabletUrl} />
        <img
          className={styles.image}
          src={assets.fallbackMobileUrl}
          alt=""
          decoding="async"
          loading="eager"
        />
      </picture>
      {children}
    </div>
  )
}
