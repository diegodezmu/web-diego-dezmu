import styles from './PageTitle.module.css'

type PageTitleProps = {
  title: string
  className?: string
  titleClassName?: string
}

export function PageTitle({ title, className = '', titleClassName = '' }: PageTitleProps) {
  return <h2 className={`${styles.title} ${className} ${titleClassName}`.trim()}>{title}</h2>
}
