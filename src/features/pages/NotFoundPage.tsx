import { Link, useLocation } from 'react-router-dom'
import { siteContent } from '@/config/content'
import { PageTitle } from '@/shared/components/PageTitle'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const location = useLocation()

  return (
    <section className={styles.page} aria-label="404 page not found">
      <h1 className="srOnly">404 page not found</h1>

      <div className={styles.panel}>
        <p className={styles.eyebrow}>{siteContent.microDisplayName}</p>

        <div className={styles.heading}>
          <p className={styles.status}>Route unavailable</p>
          <PageTitle as="span" className={styles.title} title="404" />
          <p className={styles.subtitle}>The requested page does not exist.</p>
        </div>

        <p className={styles.description}>
          The path you requested is outside the mapped sections of this portfolio. Return to the
          main entry point or jump straight to the contact section.
        </p>

        <div className={styles.pathCard}>
          <span className={styles.pathLabel}>Requested route</span>
          <code className={styles.pathValue}>{location.pathname}</code>
        </div>

        <div className={styles.actions}>
          <Link className={`${styles.action} ${styles.actionPrimary}`.trim()} to="/" data-cursor="interactive">
            Return home
          </Link>
          <Link
            className={`${styles.action} ${styles.actionSecondary}`.trim()}
            to="/contact"
            data-cursor="interactive"
          >
            Open contact
          </Link>
        </div>
      </div>
    </section>
  )
}
