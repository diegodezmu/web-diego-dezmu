import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { assets } from '@/shared/assets'
import { siteContent } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './AboutPage.module.css'

export function AboutPage() {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const aboutScrollProgress = useAppStore((state) => state.aboutScrollProgress)
  const setAboutScrollProgress = useAppStore((state) => state.setAboutScrollProgress)
  const overlayOpacity = Math.max(0, 1 - Math.min(1, aboutScrollProgress / 0.06))

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.heroCard}`,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      )
      gsap.fromTo(
        `.${styles.copyParagraph}`,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out', stagger: 0.08, delay: 0.12 },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) {
      return
    }

    const updateScroll = () => {
      const max = Math.max(1, scrollElement.scrollHeight - scrollElement.clientHeight)
      const progress = scrollElement.scrollTop / max
      setAboutScrollProgress(progress)
    }

    scrollElement.scrollTop = 0
    updateScroll()
    scrollElement.addEventListener('scroll', updateScroll, { passive: true })

    return () => {
      scrollElement.removeEventListener('scroll', updateScroll)
      setAboutScrollProgress(0)
    }
  }, [setAboutScrollProgress])

  return (
    <section ref={shellRef} className={styles.page}>
      <div ref={scrollRef} className={styles.scrollArea}>
        <div className={styles.contentColumn}>
          <div className={styles.heroCard}>
            <div className={styles.pageTitleWrap}>
              <span className={styles.pageTitleLine} aria-hidden="true" />
              <h2 className={styles.pageTitle}>{siteContent.aboutTitle}</h2>
            </div>

            <div className={styles.portraitFrame}>
              <img className={styles.portrait} src={assets.portraitUrl} alt="Portrait of Diego Dezmu" />
            </div>
          </div>

          <div className={styles.copyBlock}>
            {siteContent.aboutParagraphs.map((paragraph) => (
              <p key={paragraph} className={styles.copyParagraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.contentFade} style={{ opacity: overlayOpacity }} aria-hidden="true" />
    </section>
  )
}
