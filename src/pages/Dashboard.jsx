import React, { useEffect } from 'react'
import {
  Package, DollarSign, TrendingUp, BarChart2, ShoppingCart
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import KpiCard from '../components/ui/KpiCard.jsx'
import SalesTrendLine from '../components/charts/SalesTrendLine.jsx'
import StockBarChart from '../components/charts/StockBarChart.jsx'
import ProfitAreaChart from '../components/charts/ProfitAreaChart.jsx'
import GenderPieChart from '../components/charts/GenderPieChart.jsx'
import useInventoryStore from '../store/inventoryStore.js'
import useCustomerStore from '../store/customerStore.js'
import {
  getMonthlyStats, getTodayTransactions, getTotalInventoryValue
} from '../utils/calculations.js'
import { formatCurrency } from '../utils/formatters.js'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { items, sales, purchases, subscribeAll } = useInventoryStore()
  const { customers, subscribeAll: subCustomers } = useCustomerStore()

  useEffect(() => {
    const unsub1 = subscribeAll()
    const unsub2 = subCustomers()
    return () => { unsub1(); unsub2() }
  }, [])

  const monthly = getMonthlyStats(sales)
  const todayTx = getTodayTransactions(sales)
  const inventoryValue = getTotalInventoryValue(items)
  const margin = monthly.revenue > 0 ? (monthly.grossProfit / monthly.revenue * 100).toFixed(1) : 0

  return (
    <div className={styles.page}>
      {/* KPI 卡片列 */}
      <div className={styles.kpiGrid}>
        <KpiCard
          title="庫存總值"
          value={inventoryValue}
          icon={Package}
          color="cyan"
          formatFn={formatCurrency}
        />
        <KpiCard
          title="本月收入"
          value={monthly.revenue}
          icon={DollarSign}
          color="green"
          formatFn={formatCurrency}
        />
        <KpiCard
          title="本月成本"
          value={monthly.cost}
          icon={BarChart2}
          color="purple"
          formatFn={formatCurrency}
        />
        <KpiCard
          title="本月毛利"
          value={monthly.grossProfit}
          icon={TrendingUp}
          color="blue"
          formatFn={formatCurrency}
        />
        <KpiCard
          title="今日交易"
          value={todayTx}
          icon={ShoppingCart}
          color="amber"
          suffix=" 筆"
        />
      </div>

      {/* 圖表列 1：銷售趨勢 + 庫存排行 */}
      <div className={styles.chartRow}>
        <GlassCard title="7 天銷售趨勢" className={styles.chartCard}>
          <div className={styles.chartArea}>
            <SalesTrendLine sales={sales} days={7} />
          </div>
        </GlassCard>
        <GlassCard title="庫存排行 (前 10)" className={styles.chartCard}>
          <div className={styles.chartArea}>
            <StockBarChart items={items} />
          </div>
        </GlassCard>
      </div>

      {/* 圖表列 2：收益面積圖 + 性別分析 */}
      <div className={styles.chartRow}>
        <GlassCard title="30 天收入 vs 成本" className={`${styles.chartCard} ${styles.wide}`}>
          <div className={styles.chartArea}>
            <ProfitAreaChart sales={sales} days={30} />
          </div>
        </GlassCard>
        <GlassCard title="客戶性別分佈" className={styles.chartCard}>
          <div className={styles.chartArea}>
            <GenderPieChart customers={customers} />
          </div>
        </GlassCard>
      </div>

      {/* 底部統計摘要 */}
      <div className={styles.summaryRow}>
        <GlassCard className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>商品種類</span>
            <span className={styles.summaryValue}>{items.length}</span>
          </div>
        </GlassCard>
        <GlassCard className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>進貨記錄</span>
            <span className={styles.summaryValue}>{purchases.length}</span>
          </div>
        </GlassCard>
        <GlassCard className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>銷貨記錄</span>
            <span className={styles.summaryValue}>{sales.length}</span>
          </div>
        </GlassCard>
        <GlassCard className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>本月毛利率</span>
            <span className={`${styles.summaryValue} ${styles.cyan}`}>{margin}%</span>
          </div>
        </GlassCard>
        <GlassCard className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>客戶人數</span>
            <span className={styles.summaryValue}>{customers.length}</span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
