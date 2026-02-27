import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import NeonButton from '../components/ui/NeonButton.jsx'
import Modal from '../components/ui/Modal.jsx'
import useInventoryStore from '../store/inventoryStore.js'
import { formatCurrency, formatDate } from '../utils/formatters.js'
import styles from './Purchases.module.css'

function PurchaseForm({ items, onSave, onCancel }) {
  const [form, setForm] = useState({
    itemId: items[0]?.id || '',
    quantity: '',
    costPerUnit: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [error, setError] = useState('')

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  // 當選擇商品時，自動填入成本
  function handleItemChange(itemId) {
    const item = items.find(i => i.id === itemId)
    setForm(f => ({ ...f, itemId, costPerUnit: item ? item.costPerUnit : '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.itemId) return setError('請選擇商品')
    if (!form.quantity || Number(form.quantity) <= 0) return setError('進貨數量必須大於 0')
    if (!form.costPerUnit || Number(form.costPerUnit) <= 0) return setError('成本單價必須大於 0')
    setError('')
    onSave({
      ...form,
      quantity: Number(form.quantity),
      costPerUnit: Number(form.costPerUnit),
    })
  }

  const subtotal = (Number(form.quantity) || 0) * (Number(form.costPerUnit) || 0)

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">商品 *</label>
        <select className="form-input" value={form.itemId} onChange={e => handleItemChange(e.target.value)}>
          {items.map(i => <option key={i.id} value={i.id}>{i.name} (現有庫存: {i.quantity})</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">進貨數量 *</label>
          <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">成本單價 (NT$) *</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.costPerUnit} onChange={e => set('costPerUnit', e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">進貨日期</label>
        <input className="form-input" type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">備註</label>
        <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="選填" />
      </div>
      {subtotal > 0 && (
        <div className={styles.subtotalPreview}>
          小計金額：<span>{formatCurrency(subtotal)}</span>
        </div>
      )}
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <NeonButton variant="secondary" onClick={onCancel}>取消</NeonButton>
        <NeonButton type="submit" variant="success">確認進貨</NeonButton>
      </div>
    </form>
  )
}

export default function Purchases() {
  const { purchases, items, subscribeAll, addPurchase } = useInventoryStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => { const unsub = subscribeAll(); return () => unsub() }, [])

  const totalCost = purchases.reduce((s, p) => s + p.subtotal, 0)
  const totalQty = purchases.reduce((s, p) => s + p.quantity, 0)

  const columns = [
    { key: 'purchaseDate', label: '進貨日期', sortable: true, width: 110, render: val => formatDate(val) },
    { key: 'itemName', label: '商品名稱', sortable: true },
    {
      key: 'quantity', label: '數量', sortable: true, align: 'right', width: 80,
      render: val => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val?.toLocaleString('zh-TW')}</span>
    },
    {
      key: 'costPerUnit', label: '單價', sortable: true, align: 'right', width: 110,
      render: val => <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(val)}</span>
    },
    {
      key: 'subtotal', label: '小計', sortable: true, align: 'right', width: 130,
      render: val => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-amber)', fontWeight: 700 }}>{formatCurrency(val)}</span>
    },
    { key: 'notes', label: '備註', render: val => val || <span style={{ color: 'var(--text-muted)' }}>-</span> },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.summaryCards}>
          <GlassCard className={styles.miniCard} noPad>
            <div className={styles.miniLabel}>總進貨筆數</div>
            <div className={styles.miniValue}>{purchases.length} 筆</div>
          </GlassCard>
          <GlassCard className={styles.miniCard} noPad>
            <div className={styles.miniLabel}>總進貨數量</div>
            <div className={styles.miniValue}>{totalQty.toLocaleString('zh-TW')} 件</div>
          </GlassCard>
          <GlassCard className={styles.miniCard} noPad>
            <div className={styles.miniLabel}>累計進貨成本</div>
            <div className={`${styles.miniValue} ${styles.amber}`}>{formatCurrency(totalCost)}</div>
          </GlassCard>
        </div>
        <NeonButton icon={<Plus size={16} />} onClick={() => { setModalOpen(true); setAddError('') }}>
          新增進貨
        </NeonButton>
      </div>

      <GlassCard noPad>
        <DataTable columns={columns} data={purchases} emptyText="尚無進貨記錄" />
      </GlassCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新增進貨記錄">
        {addError && <div className="form-error" style={{ marginBottom: 12 }}>{addError}</div>}
        <PurchaseForm
          items={items}
          onSave={async (data) => {
            const result = await addPurchase(data)
            if (result?.error) { setAddError(result.error); return }
            setModalOpen(false)
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
