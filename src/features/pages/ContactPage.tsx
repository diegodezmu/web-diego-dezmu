import { useEffect, useRef, useState } from 'react'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { useAppStore } from '@/state/appStore'
import styles from './ContactPage.module.css'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest('a, button, [data-cursor="interactive"]') !== null
  )
}

export function ContactPage() {
  const shellRef = useRef<HTMLElement | null>(null)
  const pointerState = useRef<{ active: boolean; y: number }>({
    active: false,
    y: 0,
  })
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)
  const [initialContentRevealKey] = useState(contentRevealKey)
  const contactProgress = useAppStore((state) => state.contactProgress)
  const isTouch = useAppStore((state) => state.capabilities.isTouch)
  const setContactProgress = useAppStore((state) => state.setContactProgress)

  useEffect(() => {
    setContactProgress(0)
  }, [setContactProgress])

  useEffect(() => {
    const element = shellRef.current
    if (!element) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const current = useAppStore.getState().contactProgress
      setContactProgress(clamp(current + event.deltaY * 0.0026, 0, 1))
    }

    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [setContactProgress])

  const revealProgress = clamp((contactProgress - 0.01) / 0.14, 0, 1)

  return (
    <section
      ref={shellRef}
      className={styles.page}
      onPointerDown={(event) => {
        if (isInteractiveTarget(event.target)) {
          return
        }

        pointerState.current = { active: true, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!pointerState.current.active || !isTouch) {
          return
        }

        const deltaY = event.clientY - pointerState.current.y
        pointerState.current = { active: true, y: event.clientY }
        const current = useAppStore.getState().contactProgress
        setContactProgress(clamp(current + deltaY * -0.009, 0, 1))
      }}
      onPointerUp={(event) => {
        if (!pointerState.current.active) {
          return
        }

        pointerState.current.active = false

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }}
      onPointerLeave={() => {
        pointerState.current.active = false
      }}
    >
      <button
        className={styles.titleAnchor}
        type="button"
        style={{
          transform: `translate(-50%, -50%)`,
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setContactProgress(contactProgress < 0.5 ? 1 : 0)}
        data-cursor="interactive"
      >
        <PageTitle
          key={contentRevealKey}
          as="span"
          className={`${styles.titleBlock} ${
            contentRevealKey === initialContentRevealKey
              ? styles.titleBlockMount
              : styles.titleBlockReveal
          }`}
          title={siteContent.contactTitle}
        />
      </button>

      <div
        className={styles.linksBlock}
        style={{
          opacity: revealProgress,
          transform: `translate(-50%, ${10 - revealProgress * 10}vh)`,
        }}
      >
        <a
          className={styles.emailLink}
          href={`mailto:${siteContent.contactEmail}`}
          data-cursor="interactive"
        >
          {siteContent.contactEmail}
        </a>
        <div className={styles.socialRow} aria-label="Social links">
          {siteContent.contactSocialLinks.map((link) => (
            <a
              key={link.label}
              className={styles.socialLink}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="interactive"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
