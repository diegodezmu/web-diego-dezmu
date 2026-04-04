import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useLocation } from 'react-router-dom'
import {
  PAGE_TITLE_EXIT_DISTANCE,
  PAGE_TITLE_EXIT_DURATION_S,
  PAGE_TITLE_EXIT_EASE,
} from '@/app/pageTransition'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { ZoomInIcon, ZoomOutIcon } from '@/shared/components/InlineIcons'
import { useAppStore } from '@/state/appStore'
import { useStackCamera } from './stack/useStackCamera'
import { useStackGestures } from './stack/useStackGestures'
import { useStackTransition } from './stack/useStackTransition'
import styles from './StackPage.module.css'

export function StackPage() {
  const location = useLocation()
  const shellRef = useRef<HTMLElement | null>(null)
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)
  const previousContentRevealKeyRef = useRef(contentRevealKey)
  const pageTransitionPhase = useAppStore((state) => state.pageTransitionPhase)
  const pageTransitionOrigin = useAppStore((state) => state.pageTransitionOrigin)
  const stackProgress = useAppStore((state) => state.stackProgress)
  const { titleOpacity, titleShift } = useStackTransition(stackProgress)
  const {
    hintOpacity,
    zoomOpacity,
    stopInertia,
    startInertia,
    applyOrbit,
    handleZoomIn,
    handleZoomOut,
    isZoomInDisabled,
    isZoomOutDisabled,
  } = useStackCamera(stackProgress)
  const { interactionRef, titleHandlers, interactionLayerHandlers } = useStackGestures({
    stackProgress,
    stopInertia,
    startInertia,
    applyOrbit,
  })

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.titleBlock}`,
        { autoAlpha: 0, y: '15vh' },
        { autoAlpha: 1, y: 0, duration: 3, ease: 'power3.out' },
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
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power2.out' },
      )
    }, shellRef)

    return () => ctx.revert()
  }, [contentRevealKey])

  useLayoutEffect(() => {
    if (pageTransitionPhase !== 'exiting' || pageTransitionOrigin !== location.pathname) {
      return
    }

    const titleBlock = shellRef.current?.querySelector<HTMLElement>(`.${styles.titleBlock}`)
    const titleTween = titleBlock
      ? gsap.to(titleBlock, {
          autoAlpha: 0,
          y: PAGE_TITLE_EXIT_DISTANCE,
          duration: PAGE_TITLE_EXIT_DURATION_S,
          ease: PAGE_TITLE_EXIT_EASE,
          overwrite: true,
        })
      : null

    return () => {
      titleTween?.kill()
    }
  }, [location.pathname, pageTransitionOrigin, pageTransitionPhase])

  return (
    <section ref={shellRef} className={styles.page}>
      <button
        className={styles.titleAnchor}
        type="button"
        style={{
          opacity: titleOpacity,
          transform: `translate(-50%, calc(-50% - ${titleShift}vh))`,
        }}
        {...titleHandlers}
        data-cursor="interactive"
      >
        <PageTitle as="span" className={styles.titleBlock} title={siteContent.stackTitle} />
      </button>

      <div className={styles.hint} style={{ opacity: hintOpacity }}>
        Drag to orbit
      </div>

      <div
        ref={interactionRef}
        className={styles.interactionLayer}
        {...interactionLayerHandlers}
      />

      <div className={styles.zoomControls} style={{ opacity: zoomOpacity }}>
        <button
          className={styles.zoomButton}
          type="button"
          aria-label="Zoom out"
          data-cursor="interactive"
          disabled={isZoomOutDisabled}
          onClick={handleZoomOut}
        >
          <span className={styles.zoomButtonInner}>
            <ZoomOutIcon />
          </span>
        </button>

        <button
          className={styles.zoomButton}
          type="button"
          aria-label="Zoom in"
          data-cursor="interactive"
          disabled={isZoomInDisabled}
          onClick={handleZoomIn}
        >
          <span className={styles.zoomButtonInner}>
            <ZoomInIcon />
          </span>
        </button>
      </div>
    </section>
  )
}
