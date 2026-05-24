import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import NeonButton from '../components/ui/NeonButton.jsx'
import Modal from '../components/ui/Modal.jsx'
import useInventoryStore from '../store/inventoryStore.js'
import { useAuth } from '../auth/useAuth.js'
import { getMonthlyStats, getGrossMargin } from '../utils/calculations.js'
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters.js'
import styles from './Sales.module.css'

function SaleForm({ items, onSave, onCancel }) {
  const [form, setForm] = useState({
    itemId: items[0]?.id || '',
    quantity: '',
    sellPrice: '',
    saleDate: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerGender: '',
    referrer: '',
  })
  const [error, setError] = useState('')

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function handleItemChange(itemId) {
    const item = items.find(i => i.id === itemId)
    setForm(f => ({ ...f, itemId, sellPrice: item ? item.sellPrice : '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.itemId) return setError('請選擇商品')
    const item = items.find(i => i.id === form.itemId)
    if (!form.quantity || Number(form.quantity) <= 0) return setError('銷售數量必須大於 0')
    if (item && Number(form.quantity) > item.quantity) return setError(`庫存不足（現有 ${item.quantity} 件）`)
    if (!form.sellPrice || Number(form.sellPrice) <= 0) return setError('售價必須大於 0')
    setError('')
    onSave({
      ...form,
      quantity: Number(form.quantity),
      sellPrice: Number(form.sellPrice),
      customerName: form.customerName.trim() || null,
      customerGender: form.customerGender || null,
      referrer: form.referrer.trim() || null,
    })
  }

  const selectedItem = items.find(i => i.id === form.itemId)
  const revenue = (Number(form.quantity) || 0) * (Number(form.sellPrice) || 0)
  const cost = (Number(form.quantity) || 0) * (selectedItem?.costPerUnit || 0)
  const grossProfit = revenue - cost

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">商品 *</label>
        <select className="form-input" value={form.itemId} onChange={e => handleItemChange(e.target.value)}>
          {items.map(i => <option key={i.id} value={i.id}>{i.name} (庫存: {i.quantity})</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">銷售數量 *</label>
          <input className="form-input" type="number" min="1" max={selectedItem?.quantity || 9999} value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">售價 (NT$) *</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.sellPrice} onChange={e => set('sellPrice', e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">銷售日期</label>
          <input className="form-input" type="date" value={form.saleDate} onChange={e => set('saleDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">個案姓名（選填）</label>
          <input className="form-input" value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="輸入個案姓名" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">性別（選填）</label>
          <select className="form-input" value={form.customerGender} onChange={e => set('customerGender', e.target.value)}>
            <option value="">-- 不指定 --</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">轉介者（選填）</label>
          <input className="form-input" value={form.referrer} onChange={e => set('referrer', e.target.value)} placeholder="輸入轉介者名稱" />
        </div>
      </div>
      {revenue > 0 && (
        <div className={styles.profitPreview}>
          <span>收入：<strong style={{ color: 'var(--neon-cyan)' }}>{formatCurrency(revenue)}</strong></span>
          <span>成本：<strong style={{ color: 'var(--neon-purple)' }}>{formatCurrency(cost)}</strong></span>
          <span>毛利：<strong style={{ color: grossProfit >= 0 ? 'var(--neon-green)' : 'var(--neon-red)' }}>{formatCurrency(grossProfit)}</strong></span>
        </div>
      )}
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <NeonButton variant="secondary" onClick={onCancel}>取消</NeonButton>
        <NeonButton type="submit" variant="primary">確認銷貨</NeonButton>
      </div>
    </form>
  )
}

function EditSaleForm({ sale, onSave, onCancel }) {
  const [form, setForm] = useState({
    saleDate: sale.saleDate || new Date().toISOString().slice(0, 10),
    customerName: sale.customerName || '',
    customerGender: sale.customerGender || '',
    referrer: sale.referrer || '',
  })

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      customerName: form.customerName.trim() || null,
      customerGender: form.customerGender || null,
      referrer: form.referrer.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">商品名稱</label>
        <input className="form-input" value={sale.itemName} disabled style={{ opacity: 0.5 }} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">數量</label>
          <input className="form-input" value={sale.quantity} disabled style={{ opacity: 0.5 }} />
        </div>
        <div className="form-group">
          <label className="form-label">售價</label>
          <input className="form-input" value={formatCurrency(sale.sellPrice)} disabled style={{ opacity: 0.5 }} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">銷售日期</label>
        <input className="form-input" type="date" value={form.saleDate} onChange={e => set('saleDate', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">個案姓名</label>
          <input className="form-input" value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="輸入個案姓名" />
        </div>
        <div className="form-group">
          <label className="form-label">性別</label>
          <select className="form-input" value={form.customerGender} onChange={e => set('customerGender', e.target.value)}>
            <option value="">-- 不指定 --</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">轉介者</label>
        <input className="form-input" value={form.referrer} onChange={e => set('referrer', e.target.value)} placeholder="輸入轉介者名稱" />
      </div>
      <div className="form-actions">
        <NeonButton variant="secondary" onClick={onCancel}>取消</NeonButton>
        <NeonButton type="submit" variant="primary">儲存修改</NeonButton>
      </div>
    </form>
  )
}

function exportToCSV(sales) {
  const headers = ['銷售日期', '商品名稱', '數量', '售價', '收入', '成本', '毛利', '個案姓名', '性別', '轉介者']
  const rows = sales.map(s => [
    s.saleDate || '',
    s.itemName || '',
    s.quantity || 0,
    s.sellPrice || 0,
    s.revenue || 0,
    s.cost || 0,
    s.grossProfit || 0,
    s.customerName || '',
    s.customerGender || '',
    s.referrer || '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const bom = '﻿'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `銷貨報表_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Sales() {
  const { canDelete } = useAuth()
  const { sales, items, subscribeAll, addSale, updateSale, deleteSale } = useInventoryStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editSale, setEditSale] = useState(null)
  const [addError, setAddError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const unsub = subscribeAll()
    return () => unsub()
  }, [])

  const monthly = getMonthlyStats(sales)
  const margin = getGrossMargin(monthly.revenue, monthly.cost)

  const columns = [
    { key: 'saleDate', label: '銷售日期', sortable: true, width: 110, render: val => formatDate(val) },
    { key: 'itemName', label: '商品名稱', sortable: true },
    {
      key: 'quantity', label: '數量', sortable: true, align: 'right', width: 70,
      render: val => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>
    },
    {
      key: 'sellPrice', label: '售價', sortable: true, align: 'right', width: 100,
      render: val => <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(val)}</span>
    },
    {
      key: 'revenue', label: '收入', sortable: true, align: 'right', width: 110,
      render: val => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 700 }}>{formatCurrency(val)}</span>
    },
    {
      key: 'cost', label: '成本', sortable: true, align: 'right', width: 110,
      render: val => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{formatCurrency(val)}</span>
    },
    {
      key: 'grossProfit', label: '毛利', sortable: true, align: 'right', width: 110,
      render: val => (
        <span style={{ fontFamily: 'var(--font-mono)', color: val >= 0 ? 'var(--neon-green)' : 'var(--neon-red)', fontWeight: 700 }}>
          {formatCurrency(val)}
        </span>
      )
    },
    {
      key: 'customerName', label: '個案姓名', width: 100,
      render: val => val ? <span style={{ color: 'var(--neon-blue)' }}>{val}</span> : <span style={{ color: 'var(--text-muted)' }}>-</span>
    },
    {
      key: 'customerGender', label: '性別', width: 60, align: 'center',
      render: val => val || <span style={{ color: 'var(--text-muted)' }}>-</span>
    },
    {
      key: 'referrer', label: '轉介者', width: 90,
      render: val => val || <span style={{ color: 'var(--text-muted)' }}>-</span>
    },
    {
      key: 'actions', label: '操作', width: canDelete ? 90 : 60, align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
            onClick={e => { e.stopPropagation(); setEditSale(row) }}
            title="編輯"
          >
            <Pencil size={14} />
          </button>
          {canDelete && (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-red)', padding: 4 }}
              onClick={e => { e.stopPropagation(); setConfirmDelete(row) }}
              title="刪除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.summaryCards}>
          <GlassCard className={styles.miniCard} noPad>
            <div className={styles.miniLabel}>本月收入</div>
            <div className={`${styles.miniValue} ${styles.cyan}`}>{formatCurrency(monthly.revenue)}</div>
          </GlassCard>
          <GlassCard className={styles.miniCard} noPad>
            <div className={styles.miniLabel}>本月成本</div>
            <div className={`${styles.miniValue} ${styles.purple}`}>{formatCurrency(monthly.cost)}</div>
          </GlassCard>
          <GlassCard className={styles.miniCard} noPad>
            <div className={styles.miniLabel}>本月毛利</div>
            <div className={`${styles.miniValue} ${styles.green}`}>{formatCurrency(monthly.grossProfit)}</div>
          </GlassCard>
          <GlassCard className={styles.miniCard} noPad>
            <div className={styles.miniLabel}>毛利率</div>
            <div className={`${styles.miniValue} ${styles.cyan}`}>{formatPercent(margin)}</div>
          </GlassCard>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <NeonButton variant="secondary" icon={<Download size={16} />} onClick={() => exportToCSV(sales)}>
            匯出報表
          </NeonButton>
          <NeonButton icon={<Plus size={16} />} onClick={() => { setModalOpen(true); setAddError('') }}>
            新增銷貨
          </NeonButton>
        </div>
      </div>

      <GlassCard noPad>
        <DataTable columns={columns} data={sales} emptyText="尚無銷貨記錄" />
      </GlassCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新增銷貨記錄" width={580}>
        {addError && <div className="form-error" style={{ marginBottom: 12 }}>{addError}</div>}
        <SaleForm
          items={items}
          onSave={async (data) => {
            const result = await addSale(data)
            if (result?.error) { setAddError(result.error); return }
            setModalOpen(false)
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal open={!!editSale} onClose={() => setEditSale(null)} title="編輯銷貨記錄" width={480}>
        {editSale && (
          <EditSaleForm
            sale={editSale}
            onSave={async (data) => {
              await updateSale(editSale.id, data)
              setEditSale(null)
            }}
            onCancel={() => setEditSale(null)}
          />
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="確認刪除銷貨記錄" width={420}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          確定要刪除「<strong style={{ color: 'var(--text-primary)' }}>{confirmDelete?.itemName}</strong>」的銷貨記錄嗎？此操作不會還原庫存，無法復原。
        </p>
        <div className="form-actions">
          <NeonButton variant="secondary" onClick={() => setConfirmDelete(null)}>取消</NeonButton>
          <NeonButton variant="danger" onClick={() => { deleteSale(confirmDelete.id); setConfirmDelete(null) }}>確認刪除</NeonButton>
        </div>
      </Modal>
    </div>
  )
}
