import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { formatDate } from '../utils/formatters.js'
import styles from './AuditLog.module.css'

const ACTION_LABELS = {
  login: '登入',
  add_item: '新增商品',
  edit_item: '編輯商品',
  delete_item: '刪除商品',
  add_purchase: '新增進貨',
  edit_purchase: '編輯進貨',
  delete_purchase: '刪除進貨',
  add_sale: '新增銷貨',
  delete_sale: '刪除銷貨',
  add_customer: '新增客戶',
  edit_customer: '編輯客戶',
  delete_customer: '刪除客戶',
  add_user: '新增使用者',
  delete_user: '刪除使用者',
  edit_user: '修改密碼',
}

const ACTION_COLORS = {
  login: 'var(--neon-blue)',
  add_item: 'var(--neon-green)',
  edit_item: 'var(--neon-cyan)',
  delete_item: 'var(--neon-red)',
  add_purchase: 'var(--neon-green)',
  edit_purchase: 'var(--neon-cyan)',
  delete_purchase: 'var(--neon-red)',
  add_sale: 'var(--neon-green)',
  delete_sale: 'var(--neon-red)',
  add_customer: 'var(--neon-green)',
  edit_customer: 'var(--neon-cyan)',
  delete_customer: 'var(--neon-red)',
  add_user: 'var(--neon-purple)',
  delete_user: 'var(--neon-red)',
  edit_user: 'var(--neon-amber)',
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(500)
    )
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const columns = [
    {
      key: 'timestamp', label: '時間', sortable: true, width: 160,
      render: val => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
          {val ? new Date(val).toLocaleString('zh-TW', { hour12: false }) : '-'}
        </span>
      )
    },
    {
      key: 'action', label: '操作類型', width: 110, align: 'center',
      render: val => (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: ACTION_COLORS[val] || 'var(--text-primary)',
          fontWeight: 700,
        }}>
          {ACTION_LABELS[val] || val}
        </span>
      )
    },
    { key: 'description', label: '操作內容' },
    {
      key: 'userName', label: '操作人員', width: 120,
      render: val => <span style={{ color: 'var(--neon-cyan)' }}>{val || '-'}</span>
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.count}>共 <strong>{logs.length}</strong> 筆紀錄（最近 500 筆）</span>
      </div>

      <GlassCard noPad>
        {loading
          ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>載入中…</div>
          : <DataTable columns={columns} data={logs} emptyText="尚無操作紀錄" />
        }
      </GlassCard>
    </div>
  )
}
