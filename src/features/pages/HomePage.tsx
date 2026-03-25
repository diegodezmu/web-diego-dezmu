import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { siteContent } from '@/config/content'
import styles from './HomePage.module.css'

export function HomePage() {
  const shellRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.wordmark}`,
        { autoAlpha: 0, y: '15vh' },
        { autoAlpha: 1, y: 0, duration: 1.38, ease: 'power2.out' },
      )
      gsap.fromTo(
        `.${styles.roleGroup}`,
        { autoAlpha: 0, y: '8vh' },
        { autoAlpha: 1, y: 0, duration: 1.28, ease: 'power2.out', delay: 0.18 },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [])

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
