import { siteContent } from '@/config/content'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <section className={styles.page}>
      <h1 className="srOnly">{siteContent.displayName}</h1>

      <div className={styles.hero}>
        <p className={styles.wordmark}>{siteContent.displayName}</p>

        <div className={styles.roleGroup}>
          <span className={styles.roleText}>{siteContent.rolePrimary}</span>
          <span className={styles.roleLine} aria-hidden="true" />
          <span className={styles.roleText}>{siteContent.roleSecondary}</span>
        </div>
      </div>
    </section>
  )
}
