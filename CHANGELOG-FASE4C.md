# CHANGELOG FASE 4C

## Archivos creados

### `public/robots.txt`

```txt
User-agent: *
Allow: /
Sitemap: https://[DOMINIO]/sitemap.xml
```

### `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://[DOMINIO]/</loc>
  </url>
  <url>
    <loc>https://[DOMINIO]/about</loc>
  </url>
  <url>
    <loc>https://[DOMINIO]/stack</loc>
  </url>
  <url>
    <loc>https://[DOMINIO]/contact</loc>
  </url>
</urlset>
```

### `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `src/features/pages/NotFoundPage.tsx`

```tsx
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
```

### `src/features/pages/NotFoundPage.module.css`

```css
@keyframes panelEntry {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: calc(var(--frame-margin) + 32px) var(--frame-margin);
  overflow: hidden;
}

.page::before,
.page::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.page::before {
  inset: auto auto 14% 10%;
  width: min(44vw, 520px);
  height: min(44vw, 520px);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 72%);
  filter: blur(18px);
  opacity: 0.8;
}

.page::after {
  inset: 16% 8% auto;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0));
  opacity: 0.7;
}

.panel {
  position: relative;
  width: min(100%, 720px);
  display: grid;
  gap: 24px;
  padding: clamp(28px, 4vw, 56px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(11, 11, 11, 0.82), rgba(0, 0, 0, 0.66)),
    rgba(0, 0, 0, 0.55);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  animation: panelEntry 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.panel::before {
  content: '';
  position: absolute;
  inset: 20px 20px auto;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  opacity: 0.5;
}

.eyebrow,
.status {
  margin: 0;
  font-family: var(--font-display);
  text-transform: uppercase;
}

.eyebrow {
  font-size: var(--micro-logo-size);
  letter-spacing: var(--micro-logo-tracking);
  color: var(--color-light-secondary);
}

.heading {
  display: grid;
  gap: 10px;
}

.status {
  font-size: 11px;
  letter-spacing: 0.42em;
  color: var(--color-light-secondary);
}

.title {
  font-size: clamp(62px, 16vw, 156px);
  line-height: 0.9;
  letter-spacing: 0.18em;
  white-space: normal;
}

.subtitle,
.description {
  margin: 0;
  max-width: 42ch;
  color: var(--color-light-primary);
}

.subtitle {
  font-family: var(--font-display);
  font-size: clamp(15px, 2.2vw, 20px);
  line-height: 1.4;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.description {
  font-size: var(--body-size);
  line-height: 1.65;
  color: rgba(209, 209, 209, 0.9);
}

.pathCard {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.pathLabel {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-light-secondary);
}

.pathValue {
  display: block;
  overflow-wrap: anywhere;
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-light-highlight);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action {
  min-width: 180px;
  padding: 14px 18px;
  border: 1px solid transparent;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.18em;
  line-height: 1.3;
  text-align: center;
  text-transform: uppercase;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.action:hover,
.action:focus-visible {
  transform: translateY(-1px);
}

.actionPrimary {
  border-color: rgba(255, 255, 255, 0.26);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-light-highlight);
}

.actionPrimary:hover,
.actionPrimary:focus-visible {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.42);
}

.actionSecondary {
  border-color: rgba(255, 255, 255, 0.12);
  background: transparent;
  color: var(--color-light-primary);
}

.actionSecondary:hover,
.actionSecondary:focus-visible {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.04);
}

@media (max-width: 767px) {
  .page {
    padding: calc(var(--frame-margin) + 24px) var(--frame-margin) 104px;
  }

  .panel {
    gap: 20px;
  }

  .title {
    font-size: clamp(58px, 26vw, 108px);
    letter-spacing: 0.14em;
  }

  .action {
    width: 100%;
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel,
  .action {
    animation: none;
    transition: none;
  }
}
```

## Ajuste mínimo de integración

Se modificó `src/app/AppShell.tsx` para reemplazar el fallback actual que redirigía `*` a `/` por la nueva pantalla React `NotFoundPage`. Sin ese cambio, la 404 no podía activarse dentro del router de la SPA.
