import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { aggregateSalesByDay } from '../../utils/calculations.js'
import { formatCurrency } from '../../utils/formatters.js'

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
      <div style={{ color: '#8899bb', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 12, fontFamily: 'monospace', fontWeight: 700, marginBottom: 2 }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function ProfitAreaChart({ sales, days = 30 }) {
  const data = aggregateSalesByDay(sales, days)
  const sparse = days > 14 ? data.filter((_, i) => i % 3 === 0 || i === data.length - 1) : data

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,212,255,0.07)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#4a5f80', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          tick={{ fill: '#4a5f80', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="收入"
          stroke="#00d4ff"
          strokeWidth={2}
          fill="url(#revGrad)"
          animationDuration={1000}
        />
        <Area
          type="monotone"
          dataKey="cost"
          name="成本"
          stroke="#a855f7"
          strokeWidth={2}
          fill="url(#costGrad)"
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
