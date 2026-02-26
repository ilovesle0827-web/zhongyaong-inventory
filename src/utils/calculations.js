// 計算工具函式

/**
 * 取得庫存狀態
 */
export function getInventoryStatus(item) {
  if (item.quantity === 0) return { label: '缺貨', color: 'red' }
  if (item.quantity <= item.lowStockThreshold) return { label: '偏低', color: 'amber' }
  return { label: '充足', color: 'green' }
}

/**
 * 取得年齡群組
 */
export function getAgeGroup(age) {
  if (age < 18) return '18歲以下'
  if (age <= 25) return '18-25歲'
  if (age <= 35) return '26-35歲'
  if (age <= 50) return '36-50歲'
  return '51歲以上'
}

/**
 * 年齡群組順序
 */
export const AGE_GROUPS = ['18歲以下', '18-25歲', '26-35歲', '36-50歲', '51歲以上']

/**
 * 依日期聚合銷售資料 (最近 N 天)
 */
export function aggregateSalesByDay(sales, days = 7) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const daySales = sales.filter(s => s.saleDate.slice(0, 10) === dateStr)
    result.push({
      date: dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      revenue: daySales.reduce((sum, s) => sum + s.revenue, 0),
      cost: daySales.reduce((sum, s) => sum + s.cost, 0),
      grossProfit: daySales.reduce((sum, s) => sum + s.grossProfit, 0),
      count: daySales.length,
    })
  }
  return result
}

/**
 * 本月銷售統計
 */
export function getMonthlyStats(sales) {
  const now = new Date()
  const thisMonth = sales.filter(s => {
    const d = new Date(s.saleDate)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  return {
    revenue: thisMonth.reduce((sum, s) => sum + s.revenue, 0),
    cost: thisMonth.reduce((sum, s) => sum + s.cost, 0),
    grossProfit: thisMonth.reduce((sum, s) => sum + s.grossProfit, 0),
    count: thisMonth.length,
  }
}

/**
 * 今日交易數
 */
export function getTodayTransactions(sales) {
  const today = new Date().toISOString().slice(0, 10)
  return sales.filter(s => s.saleDate.slice(0, 10) === today).length
}

/**
 * 庫存總值
 */
export function getTotalInventoryValue(items) {
  return items.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0)
}

/**
 * 按性別聚合客戶
 */
export function aggregateByGender(customers) {
  const groups = { male: 0, female: 0, other: 0 }
  customers.forEach(c => {
    groups[c.gender] = (groups[c.gender] || 0) + 1
  })
  return [
    { name: '男性', value: groups.male, color: '#4f8fff' },
    { name: '女性', value: groups.female, color: '#a855f7' },
    { name: '其他', value: groups.other, color: '#4a5f80' },
  ].filter(g => g.value > 0)
}

/**
 * 按年齡群組聚合客戶
 */
export function aggregateByAge(customers) {
  const groups = {}
  AGE_GROUPS.forEach(g => { groups[g] = 0 })
  customers.forEach(c => {
    const g = getAgeGroup(c.age)
    groups[g]++
  })
  return AGE_GROUPS.map(g => ({ group: g, count: groups[g] }))
}

/**
 * 計算客戶消費統計
 */
export function getCustomerStats(sales, customerId) {
  const custSales = sales.filter(s => s.customerId === customerId)
  return {
    totalSpend: custSales.reduce((sum, s) => sum + s.revenue, 0),
    purchaseCount: custSales.length,
    avgOrderValue: custSales.length > 0
      ? custSales.reduce((sum, s) => sum + s.revenue, 0) / custSales.length
      : 0,
  }
}

/**
 * 取得毛利率 (%)
 */
export function getGrossMargin(revenue, cost) {
  if (!revenue || revenue === 0) return 0
  return ((revenue - cost) / revenue) * 100
}

/**
 * 最近 30 天利潤 vs 成本
 */
export function aggregateSalesByDay30(sales) {
  return aggregateSalesByDay(sales, 30)
}
