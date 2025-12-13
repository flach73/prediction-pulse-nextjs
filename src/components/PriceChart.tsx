'use client'
import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Price {
  price: number
  timestamp: string
}

interface Contract {
  id?: string
  contract_id: string
  ticker: string
  title: string
  yes_price: number
  prices?: Price[]
}

interface PriceChartProps {
  contracts: Contract[]
}

type TimeRange = '24h' | '7d' | '30d'

// Custom Tooltip Component - Vuexy Style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-paper border border-gray-200 dark:border-dark-lighter rounded-lg shadow-lg px-3 py-2">
        <p className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: '#7367F0' }}>
          {payload[0].value}¢
        </p>
      </div>
    )
  }
  return null
}

// Price Arrow Component
function PriceArrow({ change }: { change: number }) {
  if (change > 0) {
    return <TrendingUp className="w-4 h-4" />
  } else if (change < 0) {
    return <TrendingDown className="w-4 h-4" />
  }
  return <Minus className="w-4 h-4" />
}

export default function PriceChart({ contracts }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const topContract = contracts?.[0]

  // Filter and process chart data based on time range
  const { chartData, priceChange, priceChangePercent, currentPrice } = useMemo(() => {
    if (!topContract?.prices?.length) {
      return { chartData: [], priceChange: 0, priceChangePercent: '0', currentPrice: 0 }
    }

    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeRange) {
      case '24h':
        cutoffDate.setHours(now.getHours() - 24)
        break
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
    }

    // Filter prices by time range
    const filteredPrices = topContract.prices.filter(
      p => new Date(p.timestamp) >= cutoffDate
    )

    // Sort by timestamp
    const sortedPrices = filteredPrices.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Format for chart - different format based on range
    const chartData = sortedPrices.map(p => {
      const date = new Date(p.timestamp)
      let timeLabel: string

      if (timeRange === '24h') {
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }

      return {
        time: timeLabel,
        price: p.price > 1 ? Math.round(p.price) : Math.round(p.price * 100),
      }
    })

    // Calculate current price
    const currentPrice = topContract.yes_price > 1
      ? Math.round(topContract.yes_price)
      : Math.round(topContract.yes_price * 100)

    // Calculate price change from first data point in range
    const firstPrice = chartData[0]?.price || currentPrice
    const priceChange = currentPrice - firstPrice
    const priceChangePercent = firstPrice > 0 
      ? ((priceChange / firstPrice) * 100).toFixed(1) 
      : '0'

    return { chartData, priceChange, priceChangePercent, currentPrice }
  }, [topContract, timeRange])

  if (!topContract?.prices?.length) {
    return (
      <div className="h-48 flex items-center justify-center text-textSecondary-light dark:text-textSecondary-dark text-sm">
        No price history available
      </div>
    )
  }

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
  ]

  return (
    <div>
      {/* Price Header with Time Range Selector */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {currentPrice}¢
            </span>
            <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Yes
            </span>
          </div>
          
          {/* Price Change with Arrow */}
          <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${
            priceChange > 0 ? 'text-success' : priceChange < 0 ? 'text-error' : 'text-textSecondary-light dark:text-textSecondary-dark'
          }`}>
            <PriceArrow change={priceChange} />
            <span>
              {priceChange > 0 ? '+' : ''}{priceChange}¢ ({priceChange > 0 ? '+' : ''}{priceChangePercent}%)
            </span>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-dark-lighter rounded-lg p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${timeRange === option.value
                  ? 'bg-white dark:bg-dark-paper text-primary shadow-sm'
                  : 'text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7367F0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7367F0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(0,0,0,0.05)" 
                vertical={false}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(v) => `${v}¢`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#7367F0"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-textSecondary-light dark:text-textSecondary-dark text-sm">
            No data for selected time range
          </div>
        )}
      </div>
    </div>
  )
}
