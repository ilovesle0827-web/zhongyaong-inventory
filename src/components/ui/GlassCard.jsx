import React from 'react'
import styles from './GlassCard.module.css'

export default function GlassCard({ children, className = '', title, extra, noPad = false, row = false }) {
  let bodyClass = styles.body
  if (noPad) bodyClass = styles.bodyNoPad
  else if (row) bodyClass = styles.bodyRow

  return (
    <div className={`${styles.card} ${className}`}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {extra && <div className={styles.extra}>{extra}</div>}
        </div>
      )}
      <div className={bodyClass}>
        {children}
      </div>
    </div>
  )
}
