import { Link } from 'react-router-dom'
import { sectionLabels, sectionOrder } from '@/config/content'
import type { AppSection } from '@/shared/types'
import { useAppStore } from '@/state/appStore'
import styles from './PaginationControls.module.css'

type NeighborLink = {
  href: string
  label: string
}

function buildNeighbor(activeSection: AppSection, direction: -1 | 1): NeighborLink | null {
  const index = sectionOrder.indexOf(activeSection)
  const target = sectionOrder[index + direction]

  if (!target) {
    return null
  }

  return {
    href: target === 'home' ? '/' : `/${target}`,
    label: sectionLabels[target],
  }
}

function SideButton({
  href,
  label,
  side,
}: {
  href: string
  label: string
  side: 'left' | 'right'
}) {
  return (
    <Link
      className={`${styles.sideButton} ${side === 'left' ? styles.sideButtonLeft : styles.sideButtonRight}`}
      to={href}
      aria-label={`Go to ${label}`}
      data-cursor="interactive"
    >
      <span className={styles.sideArrow} aria-hidden="true">
        {side === 'left' ? '‹' : '›'}
      </span>
      <span className={styles.sideLabel}>{label}</span>
    </Link>
  )
}

export function PaginationControls() {
  const activeSection = useAppStore((state) => state.activeSection)
  const menuOpen = useAppStore((state) => state.menuOpen)
  const isTouch = useAppStore((state) => state.capabilities.isTouch)

  if (menuOpen) {
    return null
  }

  const previous = buildNeighbor(activeSection, -1)
  const next = buildNeighbor(activeSection, 1)
  const isMobile = isTouch || window.innerWidth <= 767

  return (
    <>
      {!isMobile && previous ? (
        <SideButton href={previous.href} label={previous.label} side="left" />
      ) : null}
      {!isMobile && next ? <SideButton href={next.href} label={next.label} side="right" /> : null}

      {isMobile ? (
        <nav className={styles.mobileNav} aria-label="Section navigation">
          {previous ? (
            <Link
              className={styles.mobileArrow}
              to={previous.href}
              aria-label={`Go to ${previous.label}`}
              data-cursor="interactive"
            >
              ‹
            </Link>
          ) : (
            <span className={styles.mobileSpacer} />
          )}

          {next ? (
            <Link
              className={styles.mobileArrow}
              to={next.href}
              aria-label={`Go to ${next.label}`}
              data-cursor="interactive"
            >
              ›
            </Link>
          ) : (
            <span className={styles.mobileSpacer} />
          )}
        </nav>
      ) : null}
    </>
  )
}
