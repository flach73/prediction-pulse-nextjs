'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import type { MarketWithPrice, PricePoint } from '@/lib/types'
import { LoadingSpinner } from './LoadingSpinner'

interface PriceChartProps {
  market: MarketWithPrice | null
  priceHistory: PricePoint[]
  loading: boolean
}

export function PriceChart({ market, priceHistory, loading }: PriceChartProps) {
  if (!market) {
    return (
      <div className="glass-panel p-6 h-96 flex items-center justify-center sticky top-24">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400">Select a market to view price history</p>
        </div>
      </div>
    )
  }

  const currentPrice = market.last_price ?? 0
  const firstPrice = priceHistory.length > 0 ? priceHistory[0].price : currentPrice
  const priceChange = currentPrice - firstPrice

  const chartData = priceHistory.map(p => ({
    timestamp: new Date(p.timestamp).getTime(),
    price: p.price,
  }))

  const minPrice = Math.min(...chartData.map(d => d.price), 0)
  const maxPrice = Math.max(...chartData.map(d => d.price), 100)
  const padding = (maxPrice - minPrice) * 0.1

  return (
    <div className="glass-panel p-6 sticky top-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`badge ${market.source === 'kalshi' ? 'badge-kalshi' : 'badge-polymarket'}`}>
            {market.source}
          </span>
        </div>
        <h3 className="font-semibold text-lg text-slate-200 line-clamp-2">
          {market.title}
        </h3>
        {market.category && (
          <p className="text-sm text-slate-500 mt-1">{market.category}</p>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-slate-500">Current Probability</p>
          <p className="text-4xl font-bold text-gradient font-mono">
            {currentPrice.toFixed(0)}%
          </p>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 ${
            priceChange > 0 ? 'text-emerald-400' : priceChange < 0 ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {priceChange > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : priceChange < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span className="font-mono font-medium">
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {priceHistory.length > 0 ? 'since first record' : 'no change data'}
          </p>
        </div>
      </div>

      <div className="h-48">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[Math.max(0, minPrice - padding), Math.min(100, maxPrice + padding)]}
                tickFormatter={(v) => `${v}%`}
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Not enough price history to display chart
          </div>
        )}
      </div>

      {market.expiry_ts && (
        <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t border-slate-800">
          <Calendar className="w-4 h-4" />
          <span>Expires: {new Date(market.expiry_ts).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">
        {new Date(label).toLocaleString()}
      </p>
      <p className="text-lg font-bold text-cyan-400 font-mono">
        {payload[0].value.toFixed(1)}%
      </p>
    </div>
  )
}