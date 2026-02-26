import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { aggregateByGender } from '../../utils/calculations.js'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div style={{
      background: 'rgba(15,22,40,0.95)',
      border: '1px solid rgba(0,212,255,0.3)',
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ color: payload[0].payload.color, fontSize: 13, fontWeight: 700 }}>{name}</div>
      <div style={{ color: '#e8f0fe', fontSize: 12, fontFamily: 'monospace' }}>{value} 人</div>
    </div>
  )
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.05) return null
  return (
    <text x={x} y={y} fill="#e8f0fe" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function GenderPieChart({ customers }) {
  const data = aggregateByGender(customers)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          {data.map(d => (
            <filter key={d.name} id={`glow-${d.name}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={CustomLabel}
          animationDuration={1000}
          animationBegin={200}
        >
          {data.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: '#8899bb', fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
