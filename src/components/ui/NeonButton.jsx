import React from 'react'
import styles from './NeonButton.module.css'

export default function NeonButton({ children, onClick, variant = 'primary', size = 'md', icon, disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  )
}
