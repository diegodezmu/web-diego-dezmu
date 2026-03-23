import { siteContent } from '@/config/content'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <section className={styles.page}>
      <h1 className="srOnly">{siteContent.displayName}</h1>
      <div className={styles.heroCopy}>
        <span className={styles.roleLine} aria-hidden="true" />
        <p className={styles.role}>{siteContent.role}</p>
      </div>
    </section>
  )
}
