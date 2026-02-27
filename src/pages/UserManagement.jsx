import React, { useState } from 'react'
import { Plus, Trash2, KeyRound } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import NeonButton from '../components/ui/NeonButton.jsx'
import Modal from '../components/ui/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import useAuthStore from '../store/authStore.js'
import { useAuth } from '../auth/useAuth.js'
import { ROLES, ROLE_LABELS } from '../auth/ROLES_CONFIG.js'
import { formatDate } from '../utils/formatters.js'
import styles from './UserManagement.module.css'

// 角色對應的 Badge 顏色
const ROLE_BADGE = {
  admin: 'purple',
  purchase_manager: 'amber',
  sales_manager: 'blue',
  sales_staff: 'green',
}

// 新增使用者表單
function AddUserForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', role: ROLES.SALES_STAFF, displayName: '' })
  const [error, setError] = useState('')

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.username) return setError('使用者名稱為必填')
    if (!form.password || form.password.length < 4) return setError('密碼至少需要 4 個字元')
    if (form.password !== form.confirmPassword) return setError('兩次密碼輸入不一致')
    setError('')
    onSave({ username: form.username, password: form.password, role: form.role, displayName: form.displayName || form.username })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">使用者名稱 *</label>
          <input className="form-input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="登入帳號" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">顯示名稱</label>
          <input className="form-input" value={form.displayName} onChange={e => set('displayName', e.target.value)} placeholder="（選填，預設同帳號）" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">角色</label>
        <select className="form-input" value={form.role} onChange={e => set('role', e.target.value)}>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">密碼 *</label>
          <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="至少 4 個字元" />
        </div>
        <div className="form-group">
          <label className="form-label">確認密碼 *</label>
          <input className="form-input" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="再次輸入密碼" />
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <NeonButton variant="secondary" onClick={onCancel}>取消</NeonButton>
        <NeonButton type="submit" variant="primary">新增使用者</NeonButton>
      </div>
    </form>
  )
}

// 修改密碼表單
function ChangePasswordForm({ user, onSave, onCancel }) {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.newPassword || form.newPassword.length < 4) return setError('密碼至少需要 4 個字元')
    if (form.newPassword !== form.confirmPassword) return setError('兩次密碼輸入不一致')
    setError('')
    onSave(form.newPassword)
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className={styles.pwHint}>正在修改「{user?.displayName}」的密碼</p>
      <div className="form-group">
        <label className="form-label">新密碼 *</label>
        <input className="form-input" type="password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} placeholder="至少 4 個字元" autoFocus />
      </div>
      <div className="form-group">
        <label className="form-label">確認新密碼 *</label>
        <input className="form-input" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="再次輸入新密碼" />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <NeonButton variant="secondary" onClick={onCancel}>取消</NeonButton>
        <NeonButton type="submit" variant="primary">確認修改</NeonButton>
      </div>
    </form>
  )
}

export default function UserManagement() {
  const { currentUser } = useAuth()
  const users = useAuthStore(state => state.users)
  const addUser = useAuthStore(state => state.addUser)
  const deleteUser = useAuthStore(state => state.deleteUser)
  const updateUserPassword = useAuthStore(state => state.updateUserPassword)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addError, setAddError] = useState('')
  const [pwModal, setPwModal] = useState(null)       // 修改密碼的目標使用者
  const [deleteTarget, setDeleteTarget] = useState(null)  // 刪除確認的目標使用者

  const columns = [
    {
      key: 'username', label: '帳號', sortable: true,
      render: val => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{val}</span>
    },
    { key: 'displayName', label: '顯示名稱', sortable: true },
    {
      key: 'role', label: '角色', sortable: true, width: 130, align: 'center',
      render: val => <Badge label={ROLE_LABELS[val] || val} color={ROLE_BADGE[val] || 'gray'} />
    },
    {
      key: 'createdAt', label: '建立時間', sortable: true, width: 130,
      render: val => formatDate(val)
    },
    {
      key: 'actions', label: '操作', width: 110, align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <button
            className={styles.iconBtn}
            onClick={(e) => { e.stopPropagation(); setPwModal(row) }}
            title="修改密碼"
          >
            <KeyRound size={14} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.danger}`}
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}
            title={row.id === currentUser?.id ? '不能刪除自己的帳號' : '刪除使用者'}
            disabled={row.id === currentUser?.id}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.summary}>
          <span className={styles.summaryText}>共 <strong>{users.length}</strong> 個帳號</span>
        </div>
        <NeonButton icon={<Plus size={16} />} onClick={() => { setAddModalOpen(true); setAddError('') }}>
          新增使用者
        </NeonButton>
      </div>

      <GlassCard noPad>
        <DataTable columns={columns} data={users} emptyText="尚無使用者帳號" />
      </GlassCard>

      {/* 新增使用者 Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="新增使用者" width={560}>
        {addError && <div className="form-error" style={{ marginBottom: 12 }}>{addError}</div>}
        <AddUserForm
          onSave={async (data) => {
            const result = await addUser(data)
            if (result?.error) { setAddError(result.error); return }
            setAddModalOpen(false)
          }}
          onCancel={() => setAddModalOpen(false)}
        />
      </Modal>

      {/* 修改密碼 Modal */}
      <Modal open={!!pwModal} onClose={() => setPwModal(null)} title="修改密碼" width={440}>
        <ChangePasswordForm
          user={pwModal}
          onSave={(newPassword) => {
            updateUserPassword(pwModal.id, newPassword)
            setPwModal(null)
          }}
          onCancel={() => setPwModal(null)}
        />
      </Modal>

      {/* 刪除確認 Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="確認刪除使用者" width={420}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          確定要刪除使用者「<strong style={{ color: 'var(--neon-red)' }}>{deleteTarget?.displayName}</strong>」（帳號：{deleteTarget?.username}）嗎？此操作無法復原。
        </p>
        <div className="form-actions">
          <NeonButton variant="secondary" onClick={() => setDeleteTarget(null)}>取消</NeonButton>
          <NeonButton variant="danger" onClick={() => { deleteUser(deleteTarget.id); setDeleteTarget(null) }}>確認刪除</NeonButton>
        </div>
      </Modal>
    </div>
  )
}
