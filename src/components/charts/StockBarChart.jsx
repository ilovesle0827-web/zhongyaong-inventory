import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,22,40,0.95)',
      border: '1px solid rgba(0,212,255,0.3)',
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ color: '#e8f0fe', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#00d4ff', fontSize: 13, fontFamily: 'monospace', fontWeight: 700 }}>
        庫存: {payload[0]?.value?.toLocaleString('zh-TW')} 件
      </div>
    </div>
  )
}

export default function StockBarChart({ items }) {
  const top10 = [...items]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map(item => ({
      name: item.name.length > 8 ? item.name.slice(0, 8) + '…' : item.name,
      fullName: item.name,
      quantity: item.quantity,
      threshold: item.lowStockThreshold,
    }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4f8fff" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,212,255,0.07)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: '#4a5f80', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#8899bb', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="quantity" fill="url(#barGrad)" radius={[0, 4, 4, 0]} animationDuration={800}>
          {top10.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.quantity <= entry.threshold ? '#ff3366' : entry.quantity <= entry.threshold * 2 ? '#ffb800' : 'url(#barGrad)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
