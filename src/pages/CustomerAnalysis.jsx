import React, { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import NeonButton from '../components/ui/NeonButton.jsx'
import Modal from '../components/ui/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import GenderPieChart from '../components/charts/GenderPieChart.jsx'
import AgeBarChart from '../components/charts/AgeBarChart.jsx'
import useCustomerStore from '../store/customerStore.js'
import useInventoryStore from '../store/inventoryStore.js'
import { getCustomerStats } from '../utils/calculations.js'
import { formatCurrency, formatDate } from '../utils/formatters.js'
import styles from './CustomerAnalysis.module.css'

const GENDER_LABEL = { male: '男性', female: '女性', other: '其他' }
const GENDER_BADGE = { male: 'blue', female: 'purple', other: 'gray' }

function CustomerForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', gender: 'male', age: '', phone: '', email: '' })
  const [error, setError] = useState('')
  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })) }
  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name) return setError('姓名為必填')
    if (!form.age || Number(form.age) < 0 || Number(form.age) > 120) return setError('請輸入有效年齡（0-120）')
    setError('')
    onSave({ ...form, age: Number(form.age) })
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">姓名 *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="客戶姓名" />
        </div>
        <div className="form-group">
          <label className="form-label">性別</label>
          <select className="form-input" value={form.gender} onChange={e => set('gender', e.target.value)}>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">其他</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">年齡 *</label>
          <input className="form-input" type="number" min="0" max="120" value={form.age} onChange={e => set('age', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">電話</label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="選填" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="選填" />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <NeonButton variant="secondary" onClick={onCancel}>取消</NeonButton>
        <NeonButton type="submit" variant="primary">新增客戶</NeonButton>
      </div>
    </form>
  )
}

export default function CustomerAnalysis() {
  const { customers, subscribeAll, addCustomer } = useCustomerStore()
  const { sales, subscribeAll: subInv } = useInventoryStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const unsub1 = subscribeAll()
    const unsub2 = subInv()
    return () => { unsub1(); unsub2() }
  }, [])

  const maleCount = customers.filter(c => c.gender === 'male').length
  const femaleCount = customers.filter(c => c.gender === 'female').length
  const avgAge = customers.length > 0
    ? Math.round(customers.reduce((s, c) => s + c.age, 0) / customers.length)
    : 0

  const columns = [
    { key: 'id', label: '客戶編號', width: 110, render: val => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>{val}</span> },
    { key: 'name', label: '姓名', sortable: true, width: 100 },
    {
      key: 'gender', label: '性別', sortable: true, width: 80, align: 'center',
      render: val => <Badge label={GENDER_LABEL[val] || val} color={GENDER_BADGE[val] || 'gray'} />
    },
    {
      key: 'age', label: '年齡', sortable: true, align: 'right', width: 60,
      render: val => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>
    },
    { key: 'phone', label: '電話', width: 130, render: val => val || <span style={{ color: 'var(--text-muted)' }}>-</span> },
    {
      key: 'totalSpend', label: '累計消費', sortable: true, align: 'right', width: 130,
      render: (_, row) => {
        const { totalSpend } = getCustomerStats(sales, row.id)
        return <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 700 }}>{formatCurrency(totalSpend)}</span>
      }
    },
    {
      key: 'purchaseCount', label: '購買次數', sortable: true, align: 'right', width: 90,
      render: (_, row) => {
        const { purchaseCount } = getCustomerStats(sales, row.id)
        return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{purchaseCount}</span>
      }
    },
    { key: 'createdAt', label: '加入日期', width: 110, render: val => formatDate(val) },
  ]

  return (
    <div className={styles.page}>
      {/* 頂部統計 */}
      <div className={styles.statsRow}>
        <GlassCard className={styles.statCard} row>
          <div className={styles.statIcon} style={{ background: 'rgba(0,212,255,0.1)' }}>
            <Users size={24} style={{ color: 'var(--neon-cyan)' }} />
          </div>
          <div>
            <div className={styles.statLabel}>總客戶數</div>
            <div className={styles.statValue}>{customers.length} 人</div>
          </div>
        </GlassCard>
        <GlassCard className={styles.statCard} row>
          <div className={styles.statIcon} style={{ background: 'rgba(79,143,255,0.1)' }}>
            <span style={{ color: 'var(--neon-blue)', fontSize: 22, fontWeight: 700 }}>♂</span>
          </div>
          <div>
            <div className={styles.statLabel}>男性客戶</div>
            <div className={styles.statValue} style={{ color: 'var(--neon-blue)' }}>{maleCount} 人</div>
          </div>
        </GlassCard>
        <GlassCard className={styles.statCard} row>
          <div className={styles.statIcon} style={{ background: 'rgba(168,85,247,0.1)' }}>
            <span style={{ color: 'var(--neon-purple)', fontSize: 22, fontWeight: 700 }}>♀</span>
          </div>
          <div>
            <div className={styles.statLabel}>女性客戶</div>
            <div className={styles.statValue} style={{ color: 'var(--neon-purple)' }}>{femaleCount} 人</div>
          </div>
        </GlassCard>
        <GlassCard className={styles.statCard} row>
          <div className={styles.statIcon} style={{ background: 'rgba(0,255,136,0.1)' }}>
            <span style={{ color: 'var(--neon-green)', fontSize: 20, fontWeight: 700 }}>Ø</span>
          </div>
          <div>
            <div className={styles.statLabel}>平均年齡</div>
            <div className={styles.statValue} style={{ color: 'var(--neon-green)' }}>{avgAge} 歲</div>
          </div>
        </GlassCard>
      </div>

      {/* 圖表列 */}
      <div className={styles.chartRow}>
        <GlassCard title="性別分析" className={styles.chartCard}>
          <div className={styles.chartArea}>
            <GenderPieChart customers={customers} />
          </div>
        </GlassCard>
        <GlassCard title="年齡分析" className={styles.chartCard}>
          <div className={styles.chartArea}>
            <AgeBarChart customers={customers} />
          </div>
        </GlassCard>
      </div>

      {/* 客戶列表 */}
      <GlassCard
        title="客戶名單"
        extra={
          <NeonButton icon={<Plus size={14} />} size="sm" onClick={() => setModalOpen(true)}>
            新增客戶
          </NeonButton>
        }
        noPad
      >
        <DataTable columns={columns} data={customers} emptyText="尚無客戶資料" />
      </GlassCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新增客戶">
        <CustomerForm onSave={(data) => { addCustomer(data); setModalOpen(false) }} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
