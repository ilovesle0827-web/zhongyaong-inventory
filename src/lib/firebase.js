import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBFKgLSC6e3-KNvleB69vXAxvPbYrGqgRk",
  authDomain: "zhongyang-inventory-a33ec.firebaseapp.com",
  projectId: "zhongyang-inventory-a33ec",
  storageBucket: "zhongyang-inventory-a33ec.firebasestorage.app",
  messagingSenderId: "465814216226",
  appId: "1:465814216226:web:a0d9cd0770bf9f83eaf47b",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
