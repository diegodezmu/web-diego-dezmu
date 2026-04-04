import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { shouldInterceptPageTransitionClick, usePageTransitionNavigation } from '@/app/usePageTransitionNavigation'
import { sectionLabels, sectionOrder } from '@/config/content'
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/components/InlineIcons'
import type { AppSection } from '@/shared/types'
import { useAppStore } from '@/state/appStore'
import styles from './PaginationControls.module.css'

type NeighborLink = {
  href: string
  label: string
}

function Chevron({
  side,
  mobile = false,
}: {
  side: 'left' | 'right'
  mobile?: boolean
}) {
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronRightIcon

  return (
    <span className={`${styles.chevron} ${mobile ? styles.mobileChevron : ''}`.trim()} aria-hidden="true">
      <Icon />
    </span>
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

function sectionToPath(section: AppSection) {
  return section === 'home' ? '/' : `/${section}`
}

function SideButton({
  href,
  label,
  side,
  mobile = false,
  exiting = false,
}: {
  href: string
  label: string
  side: 'left' | 'right'
  mobile?: boolean
  exiting?: boolean
}) {
  const navigateWithTransition = usePageTransitionNavigation()
  const exitClass = exiting ? (mobile ? styles.mobileButtonExit : styles.sideButtonExit) : ''
  const className = mobile
    ? `${styles.mobileButton} ${side === 'left' ? styles.mobileButtonLeft : styles.mobileButtonRight} ${exitClass}`.trim()
    : `${styles.sideButton} ${side === 'left' ? styles.sideButtonLeft : styles.sideButtonRight} ${exitClass}`.trim()

  return (
    <Link
      className={className}
      to={href}
      aria-label={`Go to ${label}`}
      data-cursor="interactive"
      onClick={(event) => {
        if (!shouldInterceptPageTransitionClick(event)) {
          return
        }

        event.preventDefault()
        navigateWithTransition(href)
      }}
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
  const pageTransitionPhase = useAppStore((state) => state.pageTransitionPhase)
  const pageTransitionOrigin = useAppStore((state) => state.pageTransitionOrigin)
  const mountedDuringIntroRef = useRef(!useAppStore.getState().introCompleted)
  const homeIntroClass =
    activeSection === 'home' && mountedDuringIntroRef.current ? styles.homeIntroNav : ''
  const exiting = pageTransitionPhase === 'exiting' && pageTransitionOrigin === sectionToPath(activeSection)

  if (menuOpen) {
    return null
  }

  const desktopPrevious = buildNeighbor(activeSection, -1, false)
  const mobilePrevious = buildNeighbor(activeSection, -1, true)
  const next = buildNeighbor(activeSection, 1, false)

  return (
    <>
      <nav className={`${styles.desktopNav} ${homeIntroClass}`.trim()} aria-label="Section navigation">
        {desktopPrevious ? (
          <SideButton
            href={desktopPrevious.href}
            label={desktopPrevious.label}
            side="left"
            exiting={exiting}
          />
        ) : null}
        {next ? <SideButton href={next.href} label={next.label} side="right" exiting={exiting} /> : null}
      </nav>

      <nav className={`${styles.mobileNav} ${homeIntroClass}`.trim()} aria-label="Section navigation">
        {mobilePrevious ? (
          <SideButton
            href={mobilePrevious.href}
            label={mobilePrevious.label}
            side="left"
            mobile
            exiting={exiting}
          />
        ) : (
          <span className={`${styles.mobileButton} ${styles.mobileSpacer} ${exiting ? styles.mobileButtonExit : ''}`.trim()} />
        )}

        {next ? (
          <SideButton href={next.href} label={next.label} side="right" mobile exiting={exiting} />
        ) : (
          <span className={`${styles.mobileButton} ${styles.mobileSpacer} ${exiting ? styles.mobileButtonExit : ''}`.trim()} />
        )}
      </nav>
    </>
  )
}
