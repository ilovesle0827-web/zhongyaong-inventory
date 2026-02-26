import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../auth/useAuth.js'
import { ROLE_LABELS } from '../../auth/ROLES_CONFIG.js'
import styles from './Sidebar.module.css'

// 所有導航項目（含各角色所需路徑，由 allowedPaths 過濾）
const ALL_NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: '儀表板', exact: true },
  { path: '/inventory', icon: Package, label: '庫存管理' },
  { path: '/purchases', icon: TrendingUp, label: '進貨記錄' },
  { path: '/sales', icon: ShoppingCart, label: '銷貨記錄' },
  { path: '/customers', icon: Users, label: '客戶分析' },
  { path: '/users', icon: UserCog, label: '使用者管理' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { currentUser, logout, getAllowedPaths } = useAuth()
  const navigate = useNavigate()

  const allowedPaths = getAllowedPaths()
  const navItems = ALL_NAV_ITEMS.filter(item => allowedPaths.includes(item.path))

  // 取得使用者名稱縮寫（用於收合時的頭像）
  const avatarChar = currentUser?.displayName?.[0] || currentUser?.username?.[0] || '?'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="20,3 37,12.5 37,27.5 20,37 3,27.5 3,12.5"
              stroke="#00d4ff"
              strokeWidth="2"
              fill="rgba(0,212,255,0.08)"
            />
            <polygon
              points="20,10 30,15.5 30,24.5 20,30 10,24.5 10,15.5"
              stroke="#00d4ff"
              strokeWidth="1"
              fill="rgba(0,212,255,0.04)"
              opacity="0.6"
            />
            <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="700" fill="#00d4ff" fontFamily="sans-serif">仲</text>
          </svg>
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoMain}>仲暘系統</span>
            <span className={styles.logoSub}>Inventory Pro</span>
          </div>
        )}
      </div>

      {/* 分隔線 */}
      <div className={styles.divider} />

      {/* 導航 */}
      <nav className={styles.nav}>
        {navItems.map(({ path, icon: Icon, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <span className={styles.navIcon}>
              <Icon size={20} />
            </span>
            {!collapsed && <span className={styles.navLabel}>{label}</span>}
            {!collapsed && <span className={styles.navArrow}>›</span>}
          </NavLink>
        ))}
      </nav>

      {/* 底部區域：使用者資訊 + 登出 + 收合按鈕 */}
      <div className={styles.footer}>
        <div className={styles.divider} />

        {/* 使用者資訊 */}
        {currentUser && (
          <div className={styles.userInfo} title={collapsed ? `${currentUser.displayName}（${ROLE_LABELS[currentUser.role] || currentUser.role}）` : undefined}>
            <div className={styles.userAvatar}>{avatarChar}</div>
            {!collapsed && (
              <div className={styles.userText}>
                <span className={styles.userName}>{currentUser.displayName}</span>
                <span className={styles.userRole}>{ROLE_LABELS[currentUser.role] || currentUser.role}</span>
              </div>
            )}
          </div>
        )}

        {/* 登出按鈕 */}
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title={collapsed ? '登出系統' : undefined}
        >
          <LogOut size={14} />
          {!collapsed && <span>登出系統</span>}
        </button>

        {/* 收合按鈕 */}
        <button className={styles.collapseBtn} onClick={onToggle} title={collapsed ? '展開側欄' : '收合側欄'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>收合側欄</span>}
        </button>
      </div>
    </aside>
  )
}
