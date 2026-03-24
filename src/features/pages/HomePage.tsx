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
        { autoAlpha: 0, y: '10vh' },
        { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out' },
      )
      gsap.fromTo(
        `.${styles.roleLine}, .${styles.roleText}`,
        { autoAlpha: 0, y: '8vh' },
        { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.06, ease: 'power2.out', delay: 0.12 },
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
