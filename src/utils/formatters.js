// 數字格式化工具

/**
 * 格式化為台幣金額
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'NT$ 0'
  return `NT$ ${Number(amount).toLocaleString('zh-TW')}`
}

/**
 * 格式化日期 (ISO -> 中文格式)
 */
export function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 格式化日期時間
 */
export function formatDateTime(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return `${formatDate(isoString)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * 格式化數字 (加千分位)
 */
export function formatNumber(n) {
  if (n === null || n === undefined) return '0'
  return Number(n).toLocaleString('zh-TW')
}

/**
 * 格式化百分比
 */
export function formatPercent(value, digits = 1) {
  if (value === null || value === undefined) return '0%'
  return `${Number(value).toFixed(digits)}%`
}

/**
 * 取得相對時間 (幾天前)
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '-'
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 週前`
  return `${Math.floor(days / 30)} 個月前`
}
