import styles from './PageTitle.module.css'

type PageTitleProps = {
  title: string
  className?: string
  titleClassName?: string
  as?: 'h1' | 'h2' | 'span'
}

export function PageTitle({
  title,
  className = '',
  titleClassName = '',
  as: Tag = 'h2',
}: PageTitleProps) {
  return <Tag className={`${styles.title} ${className} ${titleClassName}`.trim()}>{title}</Tag>
}
