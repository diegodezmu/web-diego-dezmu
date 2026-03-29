import { useRef } from 'react'
import { siteContent } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './HomePage.module.css'

export function HomePage() {
  const mountedDuringIntroRef = useRef(!useAppStore.getState().introCompleted)
  const contentRevealKey = useAppStore((state) => state.contentRevealKey)
  const shouldDelayHomeIntro = mountedDuringIntroRef.current && contentRevealKey === 0

  return (
    <section className={styles.page}>
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
