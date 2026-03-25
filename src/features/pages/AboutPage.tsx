import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { assets } from '@/shared/assets'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { useAppStore } from '@/state/appStore'
import styles from './AboutPage.module.css'

export function AboutPage() {
  const shellRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const aboutScrollProgress = useAppStore((state) => state.aboutScrollProgress)
  const setAboutScrollProgress = useAppStore((state) => state.setAboutScrollProgress)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.titleBlock}`,
        { autoAlpha: 0, y: '15vh' },
        { autoAlpha: 1, y: 0, duration: 1.08, ease: 'power3.out' },
      )
      gsap.fromTo(
        `.${styles.copyParagraph}`,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 0.18 },
      )
      gsap.fromTo(
        `.${styles.portraitFrame}`,
        { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.28 },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }

    const updateScroll = () => {
      const max = Math.max(1, element.scrollHeight - element.clientHeight)
      setAboutScrollProgress(element.scrollTop / max)
    }

    element.scrollTop = 0
    updateScroll()
    element.addEventListener('scroll', updateScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', updateScroll)
      setAboutScrollProgress(0)
    }
  }, [setAboutScrollProgress])

  const titleOpacity = 1 - Math.min(1, aboutScrollProgress * 1.8)
  const titleShift = Math.min(aboutScrollProgress * 220, 220)

  return (
    <section ref={shellRef} className={styles.page}>
      <div
        className={styles.titleAnchor}
        style={{
          opacity: titleOpacity,
          transform: `translate(-50%, calc(-50% - ${titleShift}px))`,
        }}
      >
        <PageTitle className={styles.titleBlock} title={siteContent.aboutTitle} />
      </div>

      <div ref={scrollRef} className={styles.scrollArea}>
        <div className={styles.contentColumn}>
          <div className={styles.copyBlock}>
            {siteContent.aboutParagraphs.map((paragraph) => (
              <p key={paragraph} className={styles.copyParagraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className={styles.portraitFrame}>
            <picture>
              <source media="(max-width: 767px)" srcSet={assets.portraitMobileUrl} />
              <img
                className={styles.portrait}
                src={assets.portraitDesktopUrl}
                alt="Portrait of Diego Dezmu"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  )
}
