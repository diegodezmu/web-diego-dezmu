import { Link } from 'react-router-dom'
import { sectionLabels, sectionOrder } from '@/config/content'
import type { AppSection } from '@/shared/types'
import { useAppStore } from '@/state/appStore'
import styles from './PaginationControls.module.css'
import chevronLeftSvg from '../../../Material/icon-chevron-left.svg?raw'
import chevronRightSvg from '../../../Material/icon-chevron-right.svg?raw'

type NeighborLink = {
  href: string
  label: string
}

const CHEVRON_MARKUP = {
  left: chevronLeftSvg,
  right: chevronRightSvg,
} as const

function Chevron({ side, mobile = false }: { side: 'left' | 'right'; mobile?: boolean }) {
  const markup = side === 'left' ? CHEVRON_MARKUP.left : CHEVRON_MARKUP.right

  return (
    <span
      className={`${styles.chevron} ${mobile ? styles.mobileChevron : ''}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
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

function SideButton({
  href,
  label,
  side,
  mobile = false,
}: {
  href: string
  label: string
  side: 'left' | 'right'
  mobile?: boolean
}) {
  return (
    <Link
      className={
        mobile
          ? `${styles.mobileButton} ${side === 'left' ? styles.mobileButtonLeft : styles.mobileButtonRight}`
          : `${styles.sideButton} ${side === 'left' ? styles.sideButtonLeft : styles.sideButtonRight}`
      }
      to={href}
      aria-label={`Go to ${label}`}
      data-cursor="interactive"
    >
      <span className={mobile ? styles.mobileButtonInner : styles.sideButtonInner}>
        <Chevron side={side} mobile={mobile} />
        {mobile ? null : <span className={styles.sideLabel}>{label}</span>}
      </span>
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
  const next = buildNeighbor(activeSection, 1, false)
  const navKey = `${activeSection}-${isMobile ? 'mobile' : 'desktop'}`

  return isMobile ? (
    <nav key={navKey} className={styles.mobileNav} aria-label="Section navigation">
      {previous ? (
        <SideButton href={previous.href} label={previous.label} side="left" mobile />
      ) : (
        <span className={`${styles.mobileButton} ${styles.mobileSpacer}`} />
      )}

      {next ? (
        <SideButton href={next.href} label={next.label} side="right" mobile />
      ) : (
        <span className={`${styles.mobileButton} ${styles.mobileSpacer}`} />
      )}
    </nav>
  ) : (
    <>
      {previous ? <SideButton key={`${navKey}-prev`} href={previous.href} label={previous.label} side="left" /> : null}
      {next ? <SideButton key={`${navKey}-next`} href={next.href} label={next.label} side="right" /> : null}
    </>
  )
}
