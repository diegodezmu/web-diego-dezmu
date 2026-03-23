import { Link } from 'react-router-dom'
import { assets } from '@/shared/assets'
import { useAppStore } from '@/state/appStore'
import { MenuToggle } from '../navigation/MenuToggle'
import styles from './Header.module.css'

export function Header() {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const showMicroLogo = !menuOpen

  return (
    <header className={styles.header}>
      <Link
        className={`${styles.logoLink} ${showMicroLogo ? styles.logoLinkVisible : ''}`}
        to="/"
        aria-label="Go to home"
        data-cursor="interactive"
      >
        <img className={styles.logoMicro} src={assets.logoMicroUrl} alt="Diego Dezmu" />
      </Link>

      {!menuOpen ? <MenuToggle /> : null}
    </header>
  )
}
