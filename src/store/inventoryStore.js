import { create } from 'zustand'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, runTransaction,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'

const useInventoryStore = create((set, get) => ({
  items: [],
  purchases: [],
  sales: [],

  // 訂閱 Firestore 即時資料，回傳 unsubscribe 函式
  subscribeAll: () => {
    const unsub1 = onSnapshot(collection(db, 'items'), snap => {
      set({ items: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    })
    const unsub2 = onSnapshot(collection(db, 'purchases'), snap => {
      set({ purchases: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    })
    const unsub3 = onSnapshot(collection(db, 'sales'), snap => {
      set({ sales: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    })
    return () => { unsub1(); unsub2(); unsub3() }
  },

  // ============ 商品 CRUD ============
  addItem: async (item) => {
    const duplicate = get().items.find(i => i.sku === item.sku)
    if (duplicate) return { error: `商品代碼「${item.sku}」已存在，請使用不同代碼` }
    await addDoc(collection(db, 'items'), {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  },

  updateItem: async (id, patch) => {
    await updateDoc(doc(db, 'items', id), {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
  },

  deleteItem: async (id) => {
    await deleteDoc(doc(db, 'items', id))
  },

  // ============ 進貨（原子寫入：建立記錄 + 增加庫存）============
  addPurchase: async (purchase) => {
    const item = get().items.find(i => i.id === purchase.itemId)
    if (!item) return { error: '找不到商品' }

    const subtotal = purchase.quantity * purchase.costPerUnit

    try {
      await runTransaction(db, async (tx) => {
        const itemRef = doc(db, 'items', purchase.itemId)
        const itemSnap = await tx.get(itemRef)
        const currentQty = itemSnap.data().quantity

        const itemUpdate = {
          quantity: currentQty + purchase.quantity,
          updatedAt: new Date().toISOString(),
        }
        if (purchase.updateCost) {
          itemUpdate.costPerUnit = purchase.costPerUnit
        }
        tx.update(itemRef, itemUpdate)

        const purchaseRef = doc(collection(db, 'purchases'))
        tx.set(purchaseRef, {
          ...purchase,
          itemName: item.name,
          subtotal,
          createdAt: new Date().toISOString(),
        })
      })
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  },

  updatePurchase: async (id, patch) => {
    await updateDoc(doc(db, 'purchases', id), patch)
  },

  deletePurchase: async (id) => {
    await deleteDoc(doc(db, 'purchases', id))
  },

  // ============ 銷貨（原子寫入：建立記錄 + 扣減庫存）============
  addSale: async (sale) => {
    const item = get().items.find(i => i.id === sale.itemId)
    if (!item) return { error: '找不到商品' }
    if (item.quantity < sale.quantity) return { error: `庫存不足（現有 ${item.quantity} 件）` }

    const revenue = sale.quantity * sale.sellPrice
    const cost = sale.quantity * item.costPerUnit
    const grossProfit = revenue - cost

    try {
      await runTransaction(db, async (tx) => {
        const itemRef = doc(db, 'items', sale.itemId)
        const itemSnap = await tx.get(itemRef)
        const currentQty = itemSnap.data().quantity

        if (currentQty < sale.quantity) {
          throw new Error(`庫存不足（現有 ${currentQty} 件）`)
        }

        tx.update(itemRef, {
          quantity: currentQty - sale.quantity,
          updatedAt: new Date().toISOString(),
        })

        const saleRef = doc(collection(db, 'sales'))
        tx.set(saleRef, {
          ...sale,
          itemName: item.name,
          costPerUnit: item.costPerUnit,
          revenue,
          cost,
          grossProfit,
          createdAt: new Date().toISOString(),
        })
      })
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  },

  deleteSale: async (id) => {
    await deleteDoc(doc(db, 'sales', id))
  },
}))

export default useInventoryStore
