import { MenuToggle } from '@/features/navigation/MenuToggle'
import { MicroLogo } from '@/shared/components/MicroLogo'
import { useAppStore } from '@/state/appStore'
import styles from './Header.module.css'

export function Header() {
  const menuOpen = useAppStore((state) => state.menuOpen)
  const activeSection = useAppStore((state) => state.activeSection)

  return (
    <header className={styles.header}>
      <div className={styles.leading}>
        {!menuOpen && activeSection !== 'home' ? <MicroLogo /> : null}
      </div>

      {!menuOpen ? <MenuToggle /> : null}
    </header>
  )
}
