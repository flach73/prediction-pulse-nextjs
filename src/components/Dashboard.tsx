'use client'

import { useState, useMemo } from 'react'
import MarketTable from './MarketTable'
import PriceChart from './PriceChart'

interface Contract {
  id: string
  contract_id: string
  ticker: string
  title: string
  yes_price: number
  volume_24h: number
  prices: { price: number; timestamp: string }[]
}

interface Market {
  id: string
  market_id: string
  title: string
  category: string
  source: string
  volume_24h: number
  contracts: Contract[]
}

interface DashboardProps {
  initialMarkets: Market[]
}

export default function Dashboard({ initialMarkets }: DashboardProps) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMarkets = useMemo(() => {
    return initialMarkets.filter(market => {
      const matchesSource = sourceFilter === "all" || market.source === sourceFilter
      const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSource && matchesSearch
    })
  }, [initialMarkets, sourceFilter, searchQuery])

  const sources = useMemo(() => {
    return Array.from(new Set(initialMarkets.map(m => m.source)))
  }, [initialMarkets])

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search markets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field max-w-xs"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSourceFilter("all")}
            className={sourceFilter === "all" ? "btn-primary" : "btn-secondary"}
          >
            All
          </button>
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              className={sourceFilter === source ? "btn-primary" : "btn-secondary"}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MarketTable
            markets={filteredMarkets}
            selectedMarket={selectedMarket}
            onSelectMarket={setSelectedMarket}
          />
        </div>
        <div className="lg:col-span-1">
          {selectedMarket ? (
            <div className="glass-panel p-5">
              <h3 className="font-medium text-[var(--text-primary)] mb-1 line-clamp-2">
                {selectedMarket.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">{selectedMarket.source}</p>
              <PriceChart contracts={selectedMarket.contracts} />
            </div>
          ) : (
            <div className="glass-panel p-8 text-center">
              <p className="text-[var(--text-muted)]">Select a market to view price history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}