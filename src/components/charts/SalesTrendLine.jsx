import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
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
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{ color: '#8899bb', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function SalesTrendLine({ sales, days = 7 }) {
  const data = aggregateSalesByDay(sales, days)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,212,255,0.07)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#4a5f80', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#4a5f80', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="收入"
          stroke="#00d4ff"
          strokeWidth={2.5}
          dot={{ fill: '#00d4ff', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#00d4ff', boxShadow: '0 0 10px #00d4ff' }}
          animationDuration={1000}
        />
        <Line
          type="monotone"
          dataKey="grossProfit"
          name="毛利"
          stroke="#00ff88"
          strokeWidth={2}
          strokeDasharray="4 2"
          dot={false}
          animationDuration={1200}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
