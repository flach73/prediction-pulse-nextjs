'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import MarketTable from './MarketTable'
import PriceChart from './PriceChart'

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
  volume_24h: number
  prices?: Price[]
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
  const searchParams = useSearchParams()
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  // Read filters from URL params (set by Sidebar)
  const sourceFilter = searchParams.get('source') || 'all'
  const searchQuery = searchParams.get('q') || ''

  const filteredMarkets = useMemo(() => {
    return initialMarkets.filter(market => {
      const matchesSource = sourceFilter === "all" || market.source === sourceFilter
      const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSource && matchesSearch
    })
  }, [initialMarkets, sourceFilter, searchQuery])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Markets Table */}
      <div className="lg:col-span-2">
        <MarketTable
          markets={filteredMarkets}
          selectedMarket={selectedMarket}
          onSelectMarket={(market) => setSelectedMarket(market)}
        />
      </div>

      {/* Price Chart Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-dark-paper rounded-card shadow-card overflow-hidden">
          {selectedMarket ? (
            <>
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-lighter">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base font-semibold text-textPrimary-light dark:text-textPrimary-dark line-clamp-2">
                      {selectedMarket.title}
                    </h3>
                    <span
                      className={`
                        inline-flex mt-2 px-2.5 py-1 text-xs font-medium rounded-md
                        ${selectedMarket.source === 'kalshi'
                          ? 'bg-info/10 text-info'
                          : 'bg-success/10 text-success'
                        }
                      `}
                    >
                      {selectedMarket.source === 'kalshi' ? 'Kalshi' : 'Polymarket'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Content */}
              <div className="p-5">
                <PriceChart contracts={selectedMarket.contracts} />
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-dark-lighter flex items-center justify-center">
                <svg className="w-8 h-8 text-textSecondary-light dark:text-textSecondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="text-textSecondary-light dark:text-textSecondary-dark font-medium">
                Select a market
              </p>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-1">
                Click on a market to view price history
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
