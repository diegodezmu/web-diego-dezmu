import { Link } from 'react-router-dom'
import { sectionLabels, sectionOrder } from '@/config/content'
import type { AppSection } from '@/shared/types'
import { useAppStore } from '@/state/appStore'
import styles from './PaginationControls.module.css'

type NeighborLink = {
  href: string
  label: string
}

function buildNeighbor(
  activeSection: AppSection,
  direction: -1 | 1,
  wrapAround: boolean,
): NeighborLink | null {
  const index = sectionOrder.indexOf(activeSection)
  const nextIndex = index + direction
  const wrappedIndex = nextIndex < 0 ? sectionOrder.length - 1 : nextIndex % sectionOrder.length
  const target = wrapAround ? sectionOrder[wrappedIndex] : sectionOrder[nextIndex]

  if (!target || target === activeSection) {
    return null
  }

  return {
    href: target === 'home' ? '/' : `/${target}`,
    label: sectionLabels[target],
  }
}

function Chevron({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      className={`${styles.chevron} ${side === 'left' ? styles.chevronLeft : styles.chevronRight}`}
      aria-hidden="true"
    />
  )
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
      <Chevron side={side} />
      <span className={styles.sideLabel}>{label}</span>
    </Link>
  )
}

export function PaginationControls() {
  const activeSection = useAppStore((state) => state.activeSection)
  const menuOpen = useAppStore((state) => state.menuOpen)
  const isTouch = useAppStore((state) => state.capabilities.isTouch)
  const isMobile = isTouch || window.innerWidth <= 767

  if (menuOpen) {
    return null
  }

  const previous = buildNeighbor(activeSection, -1, isMobile)
  const next = buildNeighbor(activeSection, 1, isMobile)

  return isMobile ? (
    <nav className={styles.mobileNav} aria-label="Section navigation">
      {previous ? (
        <Link
          className={styles.mobileArrow}
          to={previous.href}
          aria-label={`Go to ${previous.label}`}
          data-cursor="interactive"
        >
          <Chevron side="left" />
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
          <Chevron side="right" />
        </Link>
      ) : (
        <span className={styles.mobileSpacer} />
      )}
    </nav>
  ) : (
    <>
      {previous ? <SideButton href={previous.href} label={previous.label} side="left" /> : null}
      {next ? <SideButton href={next.href} label={next.label} side="right" /> : null}
    </>
  )
}
