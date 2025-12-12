'use client'

import { ChevronRight } from 'lucide-react'
import type { MarketWithPrice } from '@/lib/types'
import clsx from 'clsx'

interface MarketTableProps {
  markets: MarketWithPrice[]
  selectedMarket: MarketWithPrice | null
  onSelectMarket: (market: MarketWithPrice) => void
}

export function MarketTable({ markets, selectedMarket, onSelectMarket }: MarketTableProps) {
  if (markets.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <p className="text-slate-400">No markets found</p>
        <p className="text-sm text-slate-500 mt-2">
          Try adjusting your filters or run the ingestion script
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Market</th>
              <th className="text-right">Probability</th>
              <th className="text-right hidden sm:table-cell">Bid/Ask</th>
              <th className="text-right hidden md:table-cell">Volume</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {markets.map((market) => (
              <tr
                key={`${market.source}-${market.market_id}`}
                onClick={() => onSelectMarket(market)}
                className={clsx(
                  'cursor-pointer transition-colors',
                  selectedMarket?.id === market.id && 'bg-cyan-500/5 border-l-2 border-l-cyan-500'
                )}
              >
                <td>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'badge',
                        market.source === 'kalshi' ? 'badge-kalshi' : 'badge-polymarket'
                      )}>
                        {market.source}
                      </span>
                      <span className={clsx(
                        'badge',
                        market.status === 'open' ? 'badge-open' : 'badge-closed'
                      )}>
                        {market.status}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200 line-clamp-2 max-w-md">
                      {market.title}
                    </p>
                    {market.category && (
                      <p className="text-xs text-slate-500">{market.category}</p>
                    )}
                  </div>
                </td>
                <td className="text-right">
                  <ProbabilityDisplay value={market.last_price} />
                </td>
                <td className="text-right hidden sm:table-cell">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-emerald-400">
                      {market.bid_price != null ? `${market.bid_price.toFixed(0)}¢` : '—'}
                    </span>
                    <span className="text-sm text-rose-400">
                      {market.ask_price != null ? `${market.ask_price.toFixed(0)}¢` : '—'}
                    </span>
                  </div>
                </td>
                <td className="text-right hidden md:table-cell">
                  <span className="text-sm text-slate-400 font-mono">
                    {market.volume_24h != null ? formatVolume(market.volume_24h) : '—'}
                  </span>
                </td>
                <td>
                  <ChevronRight className={clsx(
                    'w-4 h-4 transition-colors',
                    selectedMarket?.id === market.id ? 'text-cyan-400' : 'text-slate-600'
                  )} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProbabilityDisplay({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-slate-500">—</span>
  }

  const percentage = value
  const color = percentage >= 70 
    ? 'text-emerald-400' 
    : percentage >= 30 
      ? 'text-amber-400' 
      : 'text-slate-400'

  return (
    <div className="flex flex-col items-end">
      <span className={clsx('text-2xl font-bold font-mono', color)}>
        {percentage.toFixed(0)}%
      </span>
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
        <div 
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            percentage >= 70 ? 'bg-emerald-500' : percentage >= 30 ? 'bg-amber-500' : 'bg-slate-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`
  }
  return `$${volume.toFixed(0)}`
}