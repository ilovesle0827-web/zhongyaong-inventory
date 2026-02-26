import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 初始管理員帳號（僅首次載入時使用）
const INITIAL_USERS = [
  {
    id: 'usr_admin_001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: '系統管理員',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      users: INITIAL_USERS,
      loginError: '',

      // 登入
      login: (username, password) => {
        const user = get().users.find(
          u => u.username === username && u.password === password
        )
        if (!user) {
          set({ loginError: '帳號或密碼錯誤，請重新輸入' })
          return false
        }
        set({ currentUser: user, loginError: '' })
        return true
      },

      // 登出
      logout: () => {
        set({ currentUser: null, loginError: '' })
      },

      // 清除登入錯誤訊息
      clearLoginError: () => set({ loginError: '' }),

      // 新增使用者（管理員專用）
      addUser: ({ username, password, role, displayName }) => {
        const exists = get().users.find(u => u.username === username)
        if (exists) return { error: '使用者名稱已存在' }
        const newUser = {
          id: `usr_${Date.now().toString(36)}`,
          username,
          password,
          role,
          displayName: displayName || username,
          createdAt: new Date().toISOString(),
        }
        set(state => ({ users: [...state.users, newUser] }))
        return { success: true }
      },

      // 刪除使用者（不能刪除自己）
      deleteUser: (userId) => {
        if (get().currentUser?.id === userId) {
          return { error: '不能刪除自己的帳號' }
        }
        set(state => ({ users: state.users.filter(u => u.id !== userId) }))
        return { success: true }
      },

      // 修改使用者密碼
      updateUserPassword: (userId, newPassword) => {
        set(state => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, password: newPassword } : u
          ),
        }))
        // 若修改的是目前登入者，同步更新 currentUser
        if (get().currentUser?.id === userId) {
          set(state => ({ currentUser: { ...state.currentUser, password: newPassword } }))
        }
        return { success: true }
      },
    }),
    {
      name: 'zhongyang-auth',
      version: 1,
      // 只持久化必要欄位，loginError 不需存入 localStorage
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
      }),
    }
  )
)

export default useAuthStore
