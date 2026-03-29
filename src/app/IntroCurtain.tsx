import type { AnimationEvent } from 'react'
import styles from './IntroCurtain.module.css'

type IntroCurtainProps = {
  onFinished: () => void
}

export function IntroCurtain({ onFinished }: IntroCurtainProps) {
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.pseudoElement !== '') {
      return
    }

    onFinished()
  }

  return <div className={styles.overlay} aria-hidden="true" onAnimationEnd={handleAnimationEnd} />
}
