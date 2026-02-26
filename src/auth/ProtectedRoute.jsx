import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

/**
 * ProtectedRoute — 路由守衛
 *
 * 用法 1（只檢查登入狀態）：
 *   <ProtectedRoute><AppShell>...</AppShell></ProtectedRoute>
 *
 * 用法 2（同時檢查路徑權限）：
 *   <ProtectedRoute requiredPath="/purchases"><Purchases /></ProtectedRoute>
 *
 * - 未登入 → 跳轉 /login（記錄來源路徑，登入後可跳回）
 * - 已登入但無路徑權限 → 靜默跳轉首頁 /
 */
export default function ProtectedRoute({ children, requiredPath }) {
  const { isAuthenticated, canAccessPath } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredPath && !canAccessPath(requiredPath)) {
    return <Navigate to="/" replace />
  }

  return children
}
