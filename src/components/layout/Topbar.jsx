import React, { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import styles from './Topbar.module.css'

export default function Topbar({ onToggleSidebar, pageTitle }) {
  const [time, setTime] = useState(new Date())
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = time.toLocaleTimeString('zh-TW', { hour12: false })
  const dateStr = time.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onToggleSidebar} title="展開/收合側欄">
          <Menu size={20} />
        </button>
        <span className={styles.pageTitle}>{pageTitle}</span>
      </div>

      <div className={styles.right}>
        <div className={styles.clock}>
          <span className={styles.clockDate}>{dateStr}</span>
          <span className={styles.clockTime}>{timeStr}</span>
        </div>
        <div className={styles.divider} />

        {/* 目前登入的使用者名稱 */}
        {currentUser && (
          <span className={styles.userChip}>{currentUser.displayName}</span>
        )}

        <div className={styles.divider} />
        <div className={styles.company}>
          <div className={styles.companyDot} />
          <span className={styles.companyName}>仲暘有限公司</span>
        </div>

        {/* 登出按鈕 */}
        <button className={styles.logoutBtn} onClick={handleLogout} title="登出系統">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
