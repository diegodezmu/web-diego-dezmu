import styles from './PageTitle.module.css'

type PageTitleProps = {
  title: string
  className?: string
  titleClassName?: string
}

export function PageTitle({ title, className = '', titleClassName = '' }: PageTitleProps) {
  return (
    <div className={`${styles.titleWrap} ${className}`.trim()}>
      <span className={styles.rule} aria-hidden="true" />
      <h2 className={`${styles.title} ${titleClassName}`.trim()}>{title}</h2>
    </div>
  )
}
