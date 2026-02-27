import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import styles from './AppShell.module.css'

const pageTitles = {
  '/': '儀表板',
  '/inventory': '庫存管理',
  '/purchases': '進貨記錄',
  '/sales': '銷貨記錄',
  '/customers': '客戶分析',
  '/users': '使用者管理',
  '/audit': '操作紀錄',
}

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || '儀表板'

  return (
    <div className={styles.shell}>
      {/* 背景網格效果 */}
      <div className={styles.gridBg} aria-hidden="true" />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className={styles.main}>
        <Topbar
          onToggleSidebar={() => setCollapsed(c => !c)}
          pageTitle={pageTitle}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
