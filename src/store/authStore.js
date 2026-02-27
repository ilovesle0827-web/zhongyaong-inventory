import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'

const INITIAL_ADMIN = {
  id: 'usr_admin_001',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  displayName: '系統管理員',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      loginError: '',

      // 訂閱 Firestore 使用者清單，若空則寫入初始管理員
      subscribeUsers: () => {
        getDocs(collection(db, 'users')).then(snap => {
          if (snap.empty) {
            setDoc(doc(db, 'users', INITIAL_ADMIN.id), INITIAL_ADMIN)
          }
        })
        const unsub = onSnapshot(collection(db, 'users'), snap => {
          set({ users: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
        })
        return unsub
      },

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

      logout: () => {
        set({ currentUser: null, loginError: '' })
      },

      clearLoginError: () => set({ loginError: '' }),

      addUser: async ({ username, password, role, displayName }) => {
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
        await setDoc(doc(db, 'users', newUser.id), newUser)
        return { success: true }
      },

      deleteUser: async (userId) => {
        if (get().currentUser?.id === userId) {
          return { error: '不能刪除自己的帳號' }
        }
        await deleteDoc(doc(db, 'users', userId))
        return { success: true }
      },

      updateUserPassword: async (userId, newPassword) => {
        await updateDoc(doc(db, 'users', userId), { password: newPassword })
        if (get().currentUser?.id === userId) {
          set(state => ({ currentUser: { ...state.currentUser, password: newPassword } }))
        }
        return { success: true }
      },
    }),
    {
      name: 'zhongyang-auth',
      version: 2,
      // 只持久化登入狀態，users 改由 Firestore 即時同步
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
)

export default useAuthStore
