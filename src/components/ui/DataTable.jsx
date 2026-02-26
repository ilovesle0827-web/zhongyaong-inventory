import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import styles from './DataTable.module.css'

export default function DataTable({ columns, data, rowKey = 'id', emptyText = '暫無資料', onRowClick }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    let cmp = 0
    if (typeof av === 'number') cmp = av - bv
    else cmp = String(av).localeCompare(String(bv), 'zh-TW')
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key || col.label}
                className={`${styles.th} ${col.sortable ? styles.sortable : ''}`}
                style={{ width: col.width, textAlign: col.align || 'left' }}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className={styles.thContent}>
                  {col.label}
                  {col.sortable && (
                    <span className={styles.sortIcon}>
                      {sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        : <ChevronsUpDown size={12} />}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                <div className={styles.emptyInner}>
                  <span>{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map(row => (
              <tr
                key={row[rowKey]}
                className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map(col => (
                  <td
                    key={col.key || col.label}
                    className={styles.td}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
