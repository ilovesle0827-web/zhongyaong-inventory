import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { aggregateByAge } from '../../utils/calculations.js'

const COLORS = ['#4f8fff', '#00d4ff', '#00ff88', '#a855f7', '#ffb800']

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
        {payload[0]?.value} 人
      </div>
    </div>
  )
}

export default function AgeBarChart({ customers }) {
  const data = aggregateByAge(customers)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          {COLORS.map((color, idx) => (
            <linearGradient key={idx} id={`ageGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.4} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,212,255,0.07)" vertical={false} />
        <XAxis
          dataKey="group"
          tick={{ fill: '#8899bb', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#4a5f80', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={`url(#ageGrad${idx})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
