import { create } from 'zustand'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'

const useCustomerStore = create((set) => ({
  customers: [],

  // 訂閱 Firestore 即時資料，回傳 unsubscribe 函式
  subscribeAll: () => {
    const unsub = onSnapshot(collection(db, 'customers'), snap => {
      set({ customers: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    })
    return unsub
  },

  addCustomer: async (customer) => {
    const ref = await addDoc(collection(db, 'customers'), {
      ...customer,
      createdAt: new Date().toISOString(),
    })
    return { id: ref.id, ...customer, createdAt: new Date().toISOString() }
  },

  updateCustomer: async (id, patch) => {
    await updateDoc(doc(db, 'customers', id), patch)
  },

  deleteCustomer: async (id) => {
    await deleteDoc(doc(db, 'customers', id))
  },
}))

export default useCustomerStore
