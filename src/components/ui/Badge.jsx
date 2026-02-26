import React from 'react'
import styles from './Badge.module.css'

const colorMap = {
  green: styles.green,
  amber: styles.amber,
  red: styles.red,
  cyan: styles.cyan,
  purple: styles.purple,
  blue: styles.blue,
  gray: styles.gray,
}

export default function Badge({ label, color = 'gray' }) {
  return (
    <span className={`${styles.badge} ${colorMap[color] || styles.gray}`}>
      <span className={styles.dot} />
      {label}
    </span>
  )
}
