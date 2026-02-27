import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import Purchases from './pages/Purchases.jsx'
import Sales from './pages/Sales.jsx'
import CustomerAnalysis from './pages/CustomerAnalysis.jsx'
import UserManagement from './pages/UserManagement.jsx'
import AuditLog from './pages/AuditLog.jsx'
import useAuthStore from './store/authStore.js'

export default function App() {
  const { subscribeUsers } = useAuthStore()

  useEffect(() => {
    const unsub = subscribeUsers()
    return () => unsub()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* 登入頁：完全在 AppShell 之外 */}
        <Route path="/login" element={<Login />} />

        {/* 主應用程式：需登入才能進入 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={
                    <ProtectedRoute requiredPath="/inventory">
                      <Inventory />
                    </ProtectedRoute>
                  } />
                  <Route path="/purchases" element={
                    <ProtectedRoute requiredPath="/purchases">
                      <Purchases />
                    </ProtectedRoute>
                  } />
                  <Route path="/sales" element={
                    <ProtectedRoute requiredPath="/sales">
                      <Sales />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers" element={
                    <ProtectedRoute requiredPath="/customers">
                      <CustomerAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute requiredPath="/users">
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/audit" element={
                    <ProtectedRoute requiredPath="/audit">
                      <AuditLog />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
