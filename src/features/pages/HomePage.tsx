import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { siteContent } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './HomePage.module.css'

export function HomePage() {
  const shellRef = useRef<HTMLElement | null>(null)
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.wordmark}`,
        { autoAlpha: 0, y: '15vh', xPercent: -50, yPercent: -50 },
        { autoAlpha: 1, y: 0, xPercent: -50, yPercent: -50, duration: 3, ease: 'power2.out' },
      )
      gsap.fromTo(
        `.${styles.roleGroup}`,
        { autoAlpha: 0, y: '10vh', xPercent: -50 },
        { autoAlpha: 1, y: 0, xPercent: -50, duration: 2.5, ease: 'power2.out', delay: 0.14 },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [contentRevealKey])

  return (
    <section ref={shellRef} className={styles.page}>
      <h1 className="srOnly">{siteContent.displayName}</h1>

      <div className={styles.hero}>
        <p className={styles.wordmark}>{siteContent.displayName}</p>

        <div className={styles.roleGroup}>
          <span className={styles.roleText}>{siteContent.rolePrimary}</span>
          <span className={styles.roleLine} aria-hidden="true" />
          <span className={styles.roleText}>{siteContent.roleSecondary}</span>
        </div>
      </div>
    </section>
  )
}
