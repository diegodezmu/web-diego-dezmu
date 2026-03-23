import { assets } from '@/shared/assets'
import { useAppStore } from '@/state/appStore'
import styles from './CustomCursor.module.css'

export function CustomCursor() {
  const pointer = useAppStore((state) => state.pointer)
  const capabilities = useAppStore((state) => state.capabilities)

  if (capabilities.isTouch) {
    return null
  }

  return (
    <div
      className={`${styles.cursor} ${pointer.inside ? styles.cursorVisible : ''} ${pointer.interactive ? styles.cursorInteractive : ''}`}
      style={{
        left: `${((pointer.x + 1) * 0.5) * 100}%`,
        top: `${((1 - (pointer.y + 1) * 0.5) * 100).toFixed(4)}%`,
      }}
      aria-hidden="true"
    >
      <img src={assets.cursorUrl} alt="" />
    </div>
  )
}
