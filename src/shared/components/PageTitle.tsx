import { memo } from 'react'
import styles from './PageTitle.module.css'

type PageTitleProps = {
  title: string
  className?: string
  titleClassName?: string
  as?: 'h1' | 'h2' | 'span'
  id?: string
  role?: 'heading'
  'aria-level'?: number
}

export const PageTitle = memo(function PageTitle({
  title,
  className = '',
  titleClassName = '',
  as: Tag = 'h2',
  id,
  role,
  'aria-level': ariaLevel,
}: PageTitleProps) {
  return (
    <Tag
      id={id}
      role={role}
      aria-level={ariaLevel}
      className={`${styles.title} ${className} ${titleClassName}`.trim()}
    >
      {title}
    </Tag>
  )
})

PageTitle.displayName = 'PageTitle'
