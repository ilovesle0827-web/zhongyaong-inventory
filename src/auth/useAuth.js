import useAuthStore from '../store/authStore.js'
import { ROLES_CONFIG } from './ROLES_CONFIG.js'

export function useAuth() {
  const currentUser = useAuthStore(state => state.currentUser)
  const login = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)
  const loginError = useAuthStore(state => state.loginError)
  const clearLoginError = useAuthStore(state => state.clearLoginError)

  const isAuthenticated = !!currentUser

  // 取得目前角色的設定，未登入時回傳空物件
  const roleConfig = currentUser ? (ROLES_CONFIG[currentUser.role] ?? {}) : {}

  const canAdd = roleConfig.canAdd ?? false
  const canDelete = roleConfig.canDelete ?? false
  const canManageUsers = roleConfig.canManageUsers ?? false

  // 檢查指定路徑是否在此角色的白名單內
  const canAccessPath = (path) => {
    if (!currentUser) return false
    return (roleConfig.allowedPaths ?? []).includes(path)
  }

  // 取得此角色可存取的所有路徑（給 Sidebar 過濾用）
  const getAllowedPaths = () => roleConfig.allowedPaths ?? []

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    loginError,
    clearLoginError,
    canAdd,
    canDelete,
    canManageUsers,
    canAccessPath,
    getAllowedPaths,
  }
}
