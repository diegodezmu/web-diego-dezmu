import { useEffect, useRef } from 'react'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import { useAppStore } from '@/state/appStore'
import styles from './ContactPage.module.css'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ContactPage() {
  const shellRef = useRef<HTMLElement | null>(null)
  const pointerState = useRef<{ active: boolean; y: number }>({
    active: false,
    y: 0,
  })
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
      setContactProgress(clamp(current + event.deltaY * 0.0013, 0, 1))
    }

    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [setContactProgress])

  return (
    <section
      ref={shellRef}
      className={styles.page}
      onPointerDown={(event) => {
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
        setContactProgress(clamp(current + deltaY * -0.0045, 0, 1))
      }}
      onPointerUp={(event) => {
        pointerState.current.active = false
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerLeave={() => {
        pointerState.current.active = false
      }}
    >
      <div
        className={styles.titleAnchor}
        style={{
          transform: `translate(-50%, calc(-50% - ${contactProgress * 24}px))`,
        }}
      >
        <PageTitle title={siteContent.contactTitle} />
      </div>

      <div
        className={styles.linksBlock}
        style={{
          opacity: Math.max(0, (contactProgress - 0.15) / 0.75),
          transform: `translate(-50%, ${22 - contactProgress * 22}px)`,
        }}
      >
        <a
          className={styles.emailLink}
          href={`mailto:${siteContent.contactEmail}`}
          data-cursor="interactive"
        >
          {siteContent.contactEmail}
        </a>
        <p className={styles.socialText}>{siteContent.contactSocialLabel}</p>
      </div>
    </section>
  )
}
