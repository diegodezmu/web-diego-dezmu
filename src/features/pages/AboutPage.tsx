import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { assets } from '@/shared/assets'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { useAppStore } from '@/state/appStore'
import styles from './AboutPage.module.css'

const ABOUT_CLICK_PROGRESS_TARGET = 0.81
const ABOUT_CLICK_TOGGLE_THRESHOLD = ABOUT_CLICK_PROGRESS_TARGET * 0.5
const ABOUT_CLICK_SCROLL_DURATION_S = 1.2
const TITLE_TOUCH_DRAG_THRESHOLD = 8

type TitleScrollGesture = {
  active: boolean
  moved: boolean
  pointerType: string
  startY: number
  lastY: number
}

function getAboutMaxScrollTop(element: HTMLDivElement) {
  return Math.max(0, element.scrollHeight - element.clientHeight)
}

export function AboutPage() {
  const shellRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const aboutScrollTweenRef = useRef<gsap.core.Tween | null>(null)
  const titleScrollGestureRef = useRef<TitleScrollGesture>({
    active: false,
    moved: false,
    pointerType: '',
    startY: 0,
    lastY: 0,
  })
  const [aboutScrollTop, setAboutScrollTop] = useState(0)
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)
  const previousContentRevealKeyRef = useRef(contentRevealKey)
  const aboutScrollProgress = useAppStore((state) => state.aboutScrollProgress)
  const setAboutScrollProgress = useAppStore((state) => state.setAboutScrollProgress)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.titleBlock}`,
        { autoAlpha: 0, y: '15vh' },
        { autoAlpha: 1, y: 0, duration: 3, ease: 'power3.out' },
      )
      gsap.fromTo(
        `.${styles.copyParagraph}`,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 3, stagger: 0.06, ease: 'power2.out', delay: 0.18 },
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
    if (contentRevealKey === previousContentRevealKeyRef.current) {
      return
    }

    previousContentRevealKeyRef.current = contentRevealKey

    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.titleBlock}`,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power2.out' },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [contentRevealKey])

  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    const stopAnimatedScroll = () => {
      aboutScrollTweenRef.current?.kill()
      aboutScrollTweenRef.current = null
    }

    const updateScroll = () => {
      const maxScrollTop = getAboutMaxScrollTop(element)
      setAboutScrollTop(element.scrollTop)
      setAboutScrollProgress(maxScrollTop > 0 ? element.scrollTop / maxScrollTop : 0)
    }

    element.scrollTop = 0
    updateScroll()
    element.addEventListener('scroll', updateScroll, { passive: true })
    element.addEventListener('wheel', stopAnimatedScroll, { passive: true })
    element.addEventListener('pointerdown', stopAnimatedScroll)

    return () => {
      element.removeEventListener('scroll', updateScroll)
      element.removeEventListener('wheel', stopAnimatedScroll)
      element.removeEventListener('pointerdown', stopAnimatedScroll)
      stopAnimatedScroll()
      setAboutScrollTop(0)
      setAboutScrollProgress(0)
    }
  }, [setAboutScrollProgress])

  const titleOpacity = 1 - Math.min(1, aboutScrollProgress * 1.8)
  const titleShift = aboutScrollTop
  const toggleAboutState = () => {
    const element = scrollRef.current
    if (!element) {
      return
    }

    const maxScrollTop = getAboutMaxScrollTop(element)
    const targetProgress =
      useAppStore.getState().aboutScrollProgress < ABOUT_CLICK_TOGGLE_THRESHOLD
        ? ABOUT_CLICK_PROGRESS_TARGET
        : 0

    aboutScrollTweenRef.current?.kill()
    aboutScrollTweenRef.current = null
    aboutScrollTweenRef.current = gsap.to(element, {
      scrollTop: maxScrollTop * targetProgress,
      duration: ABOUT_CLICK_SCROLL_DURATION_S,
      ease: 'power3.inOut',
      overwrite: true,
      onComplete: () => {
        aboutScrollTweenRef.current = null
      },
    })
  }

  return (
    <section ref={shellRef} className={styles.page}>
      <button
        className={styles.titleAnchor}
        type="button"
        style={{
          opacity: titleOpacity,
          transform: `translate(-50%, calc(-50% - ${titleShift}px))`,
        }}
        onWheel={(event) => {
          const element = scrollRef.current
          if (!element) {
            return
          }

          event.stopPropagation()
          event.preventDefault()
          aboutScrollTweenRef.current?.kill()
          aboutScrollTweenRef.current = null
          element.scrollTop = Math.min(
            getAboutMaxScrollTop(element),
            Math.max(0, element.scrollTop + event.deltaY),
          )
        }}
        onPointerDown={(event) => {
          titleScrollGestureRef.current = {
            active: true,
            moved: false,
            pointerType: event.pointerType,
            startY: event.clientY,
            lastY: event.clientY,
          }
          event.stopPropagation()
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const gesture = titleScrollGestureRef.current
          const element = scrollRef.current
          if (!gesture.active || gesture.pointerType !== 'touch' || !element) {
            return
          }

          const deltaY = event.clientY - gesture.lastY
          gesture.lastY = event.clientY

          if (!gesture.moved && Math.abs(event.clientY - gesture.startY) >= TITLE_TOUCH_DRAG_THRESHOLD) {
            gesture.moved = true
          }

          if (!gesture.moved) {
            return
          }

          event.preventDefault()
          event.stopPropagation()
          aboutScrollTweenRef.current?.kill()
          aboutScrollTweenRef.current = null
          element.scrollTop = Math.min(
            getAboutMaxScrollTop(element),
            Math.max(0, element.scrollTop - deltaY),
          )
        }}
        onPointerUp={(event) => {
          const gesture = titleScrollGestureRef.current
          const shouldToggle = gesture.active && !gesture.moved

          titleScrollGestureRef.current = {
            active: false,
            moved: false,
            pointerType: '',
            startY: 0,
            lastY: 0,
          }

          event.stopPropagation()
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }

          if (shouldToggle) {
            toggleAboutState()
          }
        }}
        onPointerCancel={(event) => {
          titleScrollGestureRef.current = {
            active: false,
            moved: false,
            pointerType: '',
            startY: 0,
            lastY: 0,
          }

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        data-cursor="interactive"
      >
        <PageTitle as="span" className={styles.titleBlock} title={siteContent.aboutTitle} />
      </button>

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
