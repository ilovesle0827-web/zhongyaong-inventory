import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedCustomers } from '../data/seedData.js'

function generateId() {
  return `CUST${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

const useCustomerStore = create(
  persist(
    (set, get) => ({
      customers: [],
      initialized: false,

      initialize: () => {
        if (!get().initialized) {
          set({ customers: seedCustomers, initialized: true })
        }
      },

      addCustomer: (customer) => {
        const newCustomer = {
          ...customer,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set(state => ({ customers: [...state.customers, newCustomer] }))
        return newCustomer
      },

      updateCustomer: (id, patch) => {
        set(state => ({
          customers: state.customers.map(c =>
            c.id === id ? { ...c, ...patch } : c
          ),
        }))
      },

      deleteCustomer: (id) => {
        set(state => ({ customers: state.customers.filter(c => c.id !== id) }))
      },
    }),
    {
      name: 'zhongyang-customers',
      version: 2,
      // 從 v1 升級到 v2：清除所有示範客戶資料
      migrate: (舊資料, 舊版本) => {
        if (舊版本 === 1) {
          return { ...舊資料, customers: [], initialized: false }
        }
        return 舊資料
      },
    }
  )
)

export default useCustomerStore
