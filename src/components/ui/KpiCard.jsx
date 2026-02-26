import React, { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import styles from './KpiCard.module.css'

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = Date.now()
    const startVal = 0

    function update() {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.floor(startVal + (target - startVal) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update)
      } else {
        setValue(target)
      }
    }

    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

export default function KpiCard({ title, value, prefix = '', suffix = '', icon: Icon, color = 'cyan', trend, trendLabel, formatFn }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)
  const display = formatFn ? formatFn(animated) : `${prefix}${animated.toLocaleString('zh-TW')}${suffix}`

  const colorMap = {
    cyan: { icon: 'rgba(0,212,255,0.15)', text: 'var(--neon-cyan)', glow: 'rgba(0,212,255,0.3)' },
    purple: { icon: 'rgba(168,85,247,0.15)', text: 'var(--neon-purple)', glow: 'rgba(168,85,247,0.3)' },
    green: { icon: 'rgba(0,255,136,0.15)', text: 'var(--neon-green)', glow: 'rgba(0,255,136,0.3)' },
    amber: { icon: 'rgba(255,184,0,0.15)', text: 'var(--neon-amber)', glow: 'rgba(255,184,0,0.3)' },
    blue: { icon: 'rgba(79,143,255,0.15)', text: 'var(--neon-blue)', glow: 'rgba(79,143,255,0.3)' },
  }
  const c = colorMap[color] || colorMap.cyan

  return (
    <div className={styles.card} style={{ '--kpi-color': c.text, '--kpi-glow': c.glow }}>
      {/* 底部彩條 */}
      <div className={styles.bottomBar} style={{ background: c.text }} />

      <div className={styles.top}>
        <div className={styles.iconWrap} style={{ background: c.icon }}>
          {Icon && <Icon size={22} style={{ color: c.text }} />}
        </div>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.value}>{display}</div>

      {trend !== undefined && (
        <div className={`${styles.trend} ${trend > 0 ? styles.up : trend < 0 ? styles.down : styles.flat}`}>
          {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className={styles.trendLabel}>{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}
