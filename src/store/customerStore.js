import { create } from 'zustand'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { logAudit } from '../utils/auditLogger.js'

const useCustomerStore = create((set, get) => ({
  customers: [],

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
    logAudit('add_customer', `新增客戶「${customer.name}」`)
    return { id: ref.id, ...customer, createdAt: new Date().toISOString() }
  },

  updateCustomer: async (id, patch) => {
    await updateDoc(doc(db, 'customers', id), patch)
    logAudit('edit_customer', `編輯客戶「${patch.name}」`)
  },

  deleteCustomer: async (id) => {
    const customer = get().customers.find(c => c.id === id)
    await deleteDoc(doc(db, 'customers', id))
    logAudit('delete_customer', `刪除客戶「${customer?.name}」`)
  },
}))

export default useCustomerStore
