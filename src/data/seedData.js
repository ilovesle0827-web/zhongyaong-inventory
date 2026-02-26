// 種子資料 - 首次載入時使用

function uid() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ============ 商品（初始為空，由使用者自行新增）============
export const seedItems = []

// ============ 客戶（初始為空，由使用者自行新增）============
export const seedCustomers = []

// ============ 進貨（初始為空，由使用者自行新增）============
export const seedPurchases = []

// ============ 銷貨（初始為空，由使用者自行新增）============
export const seedSales = []
