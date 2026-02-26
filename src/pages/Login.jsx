import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Lock, User } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'
import styles from './Login.module.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loginError, clearLoginError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // 若已登入則直接跳轉（避免已登入者訪問 /login）
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, location.state, navigate])

  function handleUsernameChange(e) {
    setUsername(e.target.value)
    if (loginError) clearLoginError()
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value)
    if (loginError) clearLoginError()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const success = login(username, password)
    if (success) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.gridBg} aria-hidden="true" />

      <div className={styles.card}>
        {/* 標誌區 */}
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="20,3 37,12.5 37,27.5 20,37 3,27.5 3,12.5"
                stroke="#00d4ff" strokeWidth="2" fill="rgba(0,212,255,0.08)"
              />
              <polygon
                points="20,10 30,15.5 30,24.5 20,30 10,24.5 10,15.5"
                stroke="#00d4ff" strokeWidth="1" fill="rgba(0,212,255,0.04)" opacity="0.6"
              />
              <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="700"
                fill="#00d4ff" fontFamily="sans-serif">仲</text>
            </svg>
          </div>
          <h1 className={styles.companyName}>仲暘有限公司</h1>
          <p className={styles.systemName}>Inventory Pro 管理系統</p>
        </div>

        {/* 登入表單 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>使用者名稱</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input
                className={`${styles.input} ${loginError ? styles.inputError : ''}`}
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="請輸入帳號"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>密碼</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={`${styles.input} ${loginError ? styles.inputError : ''}`}
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="請輸入密碼"
                autoComplete="current-password"
              />
            </div>
          </div>

          {loginError && (
            <div className={styles.errorMsg}>{loginError}</div>
          )}

          <button type="submit" className={styles.loginBtn}>
            <LogIn size={16} />
            登入系統
          </button>
        </form>

        <p className={styles.hint}>預設帳號：admin / admin123</p>
      </div>
    </div>
  )
}
