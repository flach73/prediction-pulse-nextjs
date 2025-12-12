'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Price {
  price: number
  timestamp: string
}

interface Contract {
  id: string
  contract_id: string
  ticker: string
  title: string
  yes_price: number
  prices?: Price[]
}

interface PriceChartProps {
  contracts: Contract[]
}

export default function PriceChart({ contracts }: PriceChartProps) {
  const topContract = contracts?.[0]
  
  if (!topContract?.prices?.length) {
    return (
      <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">
        No price history available
      </div>
    )
  }

  const chartData = topContract.prices
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(p => ({
      time: new Date(p.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      price: Math.round(p.price * 100),
    }))

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-semibold text-[var(--accent-cyan)]">
          {Math.round(topContract.yes_price * 100)}¢
        </span>
        <span className="text-sm text-[var(--text-muted)]">Yes</span>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v) => `${v}¢`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value}¢`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--accent-cyan)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}