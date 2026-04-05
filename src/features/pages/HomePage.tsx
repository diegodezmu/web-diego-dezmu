import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useLocation } from 'react-router-dom'
import {
  PAGE_TITLE_EXIT_DISTANCE,
  PAGE_TITLE_EXIT_DURATION_S,
  PAGE_TITLE_EXIT_EASE,
  PAGE_TITLE_SECONDARY_EXIT_DISTANCE,
} from '@/app/pageTransition'
import { siteContent } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './HomePage.module.css'

function freezeAnimatedElement(element: HTMLElement) {
  const computedStyles = window.getComputedStyle(element)
  const { opacity, transform } = computedStyles

  element.style.animation = 'none'
  element.style.opacity = opacity
  if (transform !== 'none') {
    element.style.transform = transform
  }
}

export function HomePage() {
  const location = useLocation()
  const shellRef = useRef<HTMLElement | null>(null)
  const mountedDuringIntroRef = useRef(!useAppStore.getState().introCompleted)
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)
  const pageTransitionPhase = useAppStore((state) => state.pageTransitionPhase)
  const pageTransitionOrigin = useAppStore((state) => state.pageTransitionOrigin)
  const reducedMotion = useAppStore((state) => state.capabilities.reducedMotion)
  const shouldDelayHomeIntro = mountedDuringIntroRef.current && contentRevealKey === 0

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    if (pageTransitionPhase !== 'exiting' || pageTransitionOrigin !== location.pathname) {
      return
    }

    const wordmark = shellRef.current?.querySelector<HTMLElement>(`.${styles.wordmark}`)
    const roleGroup = shellRef.current?.querySelector<HTMLElement>(`.${styles.roleGroup}`)

    if (wordmark) {
      freezeAnimatedElement(wordmark)
    }
    if (roleGroup) {
      freezeAnimatedElement(roleGroup)
    }

    const wordmarkTween = wordmark
      ? gsap.to(wordmark, {
          autoAlpha: 0,
          y: PAGE_TITLE_EXIT_DISTANCE,
          duration: PAGE_TITLE_EXIT_DURATION_S,
          ease: PAGE_TITLE_EXIT_EASE,
          overwrite: true,
        })
      : null
    const roleGroupTween = roleGroup
      ? gsap.to(roleGroup, {
          autoAlpha: 0,
          y: PAGE_TITLE_SECONDARY_EXIT_DISTANCE,
          duration: PAGE_TITLE_EXIT_DURATION_S * 0.92,
          ease: PAGE_TITLE_EXIT_EASE,
          overwrite: true,
        })
      : null

    return () => {
      wordmarkTween?.kill()
      roleGroupTween?.kill()
    }
  }, [location.pathname, pageTransitionOrigin, pageTransitionPhase, reducedMotion])

  return (
    <section ref={shellRef} className={styles.page}>
      <h1 className="srOnly">{siteContent.displayName}</h1>

      <div key={contentRevealKey} className={styles.hero}>
        <p
          className={`${styles.wordmark} ${shouldDelayHomeIntro ? styles.wordmarkIntroDelay : ''}`.trim()}
        >
          {siteContent.displayName}
        </p>

        <div
          className={`${styles.roleGroup} ${shouldDelayHomeIntro ? styles.roleGroupIntroDelay : ''}`.trim()}
        >
          <span className={styles.roleText}>{siteContent.rolePrimary}</span>
          <span className={styles.roleLine} aria-hidden="true" />
          <span className={styles.roleText}>{siteContent.roleSecondary}</span>
        </div>
      </div>
    </section>
  )
}
