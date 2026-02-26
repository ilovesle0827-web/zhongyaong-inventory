import React, { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import NeonButton from '../components/ui/NeonButton.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import useInventoryStore from '../store/inventoryStore.js'
import { useAuth } from '../auth/useAuth.js'
import { getInventoryStatus } from '../utils/calculations.js'
import { formatCurrency, formatDate } from '../utils/formatters.js'
import styles from './Inventory.module.css'

const CATEGORIES = ['電子產品', '電腦周邊', '家具', '家電', '配件', '生活用品', '其他']

function ItemForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '', sku: '', category: '電子產品',
    quantity: '', costPerUnit: '', sellPrice: '', lowStockThreshold: '20',
  })
  const [error, setError] = useState('')

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.sku) return setError('商品名稱及代碼為必填')
    if (Number(form.quantity) < 0) return setError('數量不能為負數')
    if (Number(form.costPerUnit) < 0 || Number(form.sellPrice) < 0) return setError('價格不能為負數')
    setError('')
    onSave({
      ...form,
      quantity: Number(form.quantity) || 0,
      costPerUnit: Number(form.costPerUnit) || 0,
      sellPrice: Number(form.sellPrice) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 10,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">商品名稱 *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="例：無線藍牙耳機" />
        </div>
        <div className="form-group">
          <label className="form-label">商品代碼 *</label>
          <input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="例：SKU-A001" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">類別</label>
        <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">初始庫存數量</label>
          <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">警示庫量</label>
          <input className="form-input" type="number" min="0" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} placeholder="20" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">成本單價 (NT$)</label>
          <input className="form-input" type="number" min="0" value={form.costPerUnit} onChange={e => set('costPerUnit', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">建議售價 (NT$)</label>
          <input className="form-input" type="number" min="0" value={form.sellPrice} onChange={e => set('sellPrice', e.target.value)} placeholder="0" />
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <NeonButton variant="secondary" onClick={onCancel}>取消</NeonButton>
        <NeonButton type="submit" variant="primary">儲存</NeonButton>
      </div>
    </form>
  )
}

export default function Inventory() {
  const { canDelete } = useAuth()
  const { items, initialize, addItem, updateItem, deleteItem } = useInventoryStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { initialize() }, [])

  const filtered = items.filter(i =>
    i.name.includes(search) || i.sku.includes(search) || i.category.includes(search)
  )

  const columns = [
    { key: 'sku', label: '代碼', sortable: true, width: 100 },
    { key: 'name', label: '商品名稱', sortable: true },
    { key: 'category', label: '類別', sortable: true, width: 110 },
    {
      key: 'quantity', label: '庫存', sortable: true, align: 'right', width: 80,
      render: (val, row) => {
        const { color } = getInventoryStatus(row)
        const textColor = color === 'green' ? 'var(--neon-green)' : color === 'amber' ? 'var(--neon-amber)' : 'var(--neon-red)'
        return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: textColor }}>{val?.toLocaleString('zh-TW')}</span>
      }
    },
    {
      key: 'costPerUnit', label: '成本', sortable: true, align: 'right', width: 110,
      render: val => <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(val)}</span>
    },
    {
      key: 'sellPrice', label: '售價', sortable: true, align: 'right', width: 110,
      render: val => <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(val)}</span>
    },
    {
      key: 'status', label: '狀態', width: 90, align: 'center',
      render: (_, row) => {
        const { label, color } = getInventoryStatus(row)
        return <Badge label={label} color={color} />
      }
    },
    {
      key: 'actions', label: '操作', width: 90, align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); setEditItem(row); setModalOpen(true) }} title="編輯">
            <Pencil size={14} />
          </button>
          {canDelete && (
            <button className={`${styles.iconBtn} ${styles.danger}`} onClick={(e) => { e.stopPropagation(); setConfirmDelete(row) }} title="刪除">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    },
  ]

  const lowStockCount = items.filter(i => getInventoryStatus(i).color !== 'green').length

  return (
    <div className={styles.page}>
      {/* 頁頭 */}
      <div className={styles.header}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="搜尋商品名稱、代碼、類別…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <NeonButton icon={<Plus size={16} />} onClick={() => { setEditItem(null); setModalOpen(true) }}>
          新增商品
        </NeonButton>
      </div>

      {/* 警示列 */}
      {lowStockCount > 0 && (
        <div className={styles.alert}>
          <AlertTriangle size={16} />
          <span>目前有 <strong>{lowStockCount}</strong> 項商品庫存偏低或缺貨，請注意補貨！</span>
        </div>
      )}

      {/* 資料表格 */}
      <GlassCard noPad>
        <DataTable columns={columns} data={filtered} emptyText="尚無商品資料，請點擊「新增商品」" />
      </GlassCard>

      {/* 新增/編輯 Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        title={editItem ? '編輯商品' : '新增商品'}
      >
        <ItemForm
          initial={editItem}
          onSave={(data) => {
            if (editItem) updateItem(editItem.id, data)
            else addItem(data)
            setModalOpen(false)
            setEditItem(null)
          }}
          onCancel={() => { setModalOpen(false); setEditItem(null) }}
        />
      </Modal>

      {/* 刪除確認 Modal */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="確認刪除"
        width={400}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          確定要刪除商品「<strong style={{ color: 'var(--text-primary)' }}>{confirmDelete?.name}</strong>」嗎？此操作無法復原。
        </p>
        <div className="form-actions">
          <NeonButton variant="secondary" onClick={() => setConfirmDelete(null)}>取消</NeonButton>
          <NeonButton variant="danger" onClick={() => { deleteItem(confirmDelete.id); setConfirmDelete(null) }}>確認刪除</NeonButton>
        </div>
      </Modal>
    </div>
  )
}
