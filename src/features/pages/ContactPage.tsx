import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { siteContent } from '@/config/content'
import styles from './ContactPage.module.css'

export function ContactPage() {
  const shellRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.mailButton}`,
        { autoAlpha: 0, x: -18 },
        { autoAlpha: 1, x: 0, duration: 0.38, ease: 'power2.out' },
      )
      gsap.fromTo(
        `.${styles.titleLine}`,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out', stagger: 0.06, delay: 0.08 },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={shellRef} className={styles.page}>
      <div className={styles.contentWrap}>
        <a
          className={styles.mailButton}
          href={`mailto:${siteContent.contactEmail}`}
          data-cursor="interactive"
        >
          {siteContent.contactEmail}
        </a>

        <div className={styles.titleBlock}>
          {siteContent.contactTitleLines.map((line) => (
            <p key={line} className={styles.titleLine}>
              {line}
            </p>
          ))}
        </div>
      </div>

      <p className={styles.caption}>{siteContent.contactCaption}</p>
    </section>
  )
}
