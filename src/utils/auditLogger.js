import { collection, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import useAuthStore from '../store/authStore.js'

export async function logAudit(action, description) {
  try {
    const currentUser = useAuthStore.getState().currentUser
    await addDoc(collection(db, 'auditLogs'), {
      action,
      description,
      userId: currentUser?.id || '',
      userName: currentUser?.displayName || currentUser?.username || '系統',
      userRole: currentUser?.role || '',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('Audit log failed:', err)
  }
}
