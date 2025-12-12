'use client'

import { TrendingUp, Layers, Activity, CheckCircle } from 'lucide-react'

interface StatsBarProps {
  stats: {
    total: number
    kalshi: number
    polymarket: number
    active: number
  }
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'Total Markets', value: stats.total, icon: Layers, color: 'text-slate-400' },
    { label: 'Kalshi', value: stats.kalshi, icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'Polymarket', value: stats.polymarket, icon: Activity, color: 'text-violet-400' },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div 
          key={item.label}
          className="stat-card animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">{item.label}</p>
              <p className="stat-value mt-1">{item.value.toLocaleString()}</p>
            </div>
            <item.icon className={`w-8 h-8 ${item.color} opacity-50`} />
          </div>
        </div>
      ))}
    </div>
  )
}