import { siteContent } from '@/config/content'
import { useAppStore } from '@/state/appStore'
import styles from './HomePage.module.css'

export function HomePage() {
  const introCompleted = useAppStore((state) => state.introCompleted)

  return (
    <section className={styles.page}>
      <h1 className="srOnly">{siteContent.displayName}</h1>

      <div className={styles.hero}>
        <p className={`${styles.wordmark} ${!introCompleted ? styles.wordmarkIntroDelay : ''}`.trim()}>
          {siteContent.displayName}
        </p>

        <div className={`${styles.roleGroup} ${!introCompleted ? styles.roleGroupIntroDelay : ''}`.trim()}>
          <span className={styles.roleText}>{siteContent.rolePrimary}</span>
          <span className={styles.roleLine} aria-hidden="true" />
          <span className={styles.roleText}>{siteContent.roleSecondary}</span>
        </div>
      </div>
    </section>
  )
}
