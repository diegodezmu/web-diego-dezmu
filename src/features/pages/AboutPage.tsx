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
        { autoAlpha: 0, y: '10vh' },
        { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out' },
      )
      gsap.fromTo(
        `.${styles.copyParagraph}`,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.46, stagger: 0.06, ease: 'power2.out', delay: 0.14 },
      )
      gsap.fromTo(
        `.${styles.portraitFrame}`,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.54, ease: 'power2.out', delay: 0.24 },
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
  const titleShift = Math.min(aboutScrollProgress * 64, 64)

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
            <img
              className={styles.portrait}
              src={window.innerWidth <= 767 ? assets.portraitMobileUrl : assets.portraitDesktopUrl}
              alt="Portrait of Diego Dezmu"
            />
          </div>
        </div>
      </div>

      <div className={styles.contentFade} aria-hidden="true" />
    </section>
  )
}
