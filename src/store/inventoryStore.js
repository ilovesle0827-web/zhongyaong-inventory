import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedItems, seedPurchases, seedSales } from '../data/seedData.js'

function generateId(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

const useInventoryStore = create(
  persist(
    (set, get) => ({
      items: [],
      purchases: [],
      sales: [],
      initialized: false,

      // 初始化種子資料
      initialize: () => {
        if (!get().initialized) {
          set({ items: seedItems, purchases: seedPurchases, sales: seedSales, initialized: true })
        }
      },

      // ============ 商品 CRUD ============
      addItem: (item) => {
        const newItem = {
          ...item,
          id: generateId('INV'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(state => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, patch) => {
        set(state => ({
          items: state.items.map(item =>
            item.id === id
              ? { ...item, ...patch, updatedAt: new Date().toISOString() }
              : item
          ),
        }))
      },

      deleteItem: (id) => {
        set(state => ({ items: state.items.filter(item => item.id !== id) }))
      },

      // ============ 進貨 ============
      addPurchase: (purchase) => {
        const item = get().items.find(i => i.id === purchase.itemId)
        if (!item) return { error: '找不到商品' }

        const subtotal = purchase.quantity * purchase.costPerUnit
        const newPurchase = {
          ...purchase,
          id: generateId('PUR'),
          itemName: item.name,
          subtotal,
          createdAt: new Date().toISOString(),
        }

        set(state => ({
          purchases: [...state.purchases, newPurchase],
          items: state.items.map(i =>
            i.id === purchase.itemId
              ? { ...i, quantity: i.quantity + purchase.quantity, updatedAt: new Date().toISOString() }
              : i
          ),
        }))
        return { success: true, purchase: newPurchase }
      },

      deletePurchase: (id) => {
        set(state => ({ purchases: state.purchases.filter(p => p.id !== id) }))
      },

      // ============ 銷貨 ============
      addSale: (sale) => {
        const item = get().items.find(i => i.id === sale.itemId)
        if (!item) return { error: '找不到商品' }
        if (item.quantity < sale.quantity) return { error: `庫存不足（現有 ${item.quantity} 件）` }

        const revenue = sale.quantity * sale.sellPrice
        const cost = sale.quantity * item.costPerUnit
        const grossProfit = revenue - cost

        const newSale = {
          ...sale,
          id: generateId('SAL'),
          itemName: item.name,
          costPerUnit: item.costPerUnit,
          revenue,
          cost,
          grossProfit,
          createdAt: new Date().toISOString(),
        }

        set(state => ({
          sales: [...state.sales, newSale],
          items: state.items.map(i =>
            i.id === sale.itemId
              ? { ...i, quantity: i.quantity - sale.quantity, updatedAt: new Date().toISOString() }
              : i
          ),
        }))
        return { success: true, sale: newSale }
      },

      deleteSale: (id) => {
        set(state => ({ sales: state.sales.filter(s => s.id !== id) }))
      },
    }),
    {
      name: 'zhongyang-inventory',
      version: 3,
      // 從 v2 升級到 v3：清除所有商品示範資料，重設初始化狀態
      migrate: (舊資料, 舊版本) => {
        if (舊版本 === 1) {
          return { ...舊資料, purchases: [], sales: [] }
        }
        if (舊版本 === 2) {
          return { ...舊資料, items: [], initialized: false }
        }
        return 舊資料
      },
    }
  )
)

export default useInventoryStore
