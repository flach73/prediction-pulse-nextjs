'use client'
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

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

interface MarketTableProps {
  markets: Market[]
  selectedMarket: Market | null
  onSelectMarket: (market: Market) => void
}

type SortField = 'title' | 'price' | 'volume' | 'source'
type SortDirection = 'asc' | 'desc'

const ITEMS_PER_PAGE = 10

function formatVolume(volume: number): string {
  if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
  if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`
  return `$${volume.toFixed(0)}`
}

function formatPrice(price: number): string {
  if (price > 1) return `${Math.round(price)}¢`
  return `${Math.round(price * 100)}¢`
}

function getMarketPrice(market: Market): number {
  const topContract = market.contracts?.[0]
  if (!topContract) return 0
  return topContract.yes_price > 1 ? topContract.yes_price : topContract.yes_price * 100
}

// Sort Icon Component
function SortIcon({ field, currentField, direction }: { field: SortField; currentField: SortField | null; direction: SortDirection }) {
  if (currentField !== field) {
    return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
  }
  return direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-primary" />
    : <ChevronDown className="w-4 h-4 text-primary" />
}

export default function MarketTable({ markets, selectedMarket, onSelectMarket }: MarketTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Handle column header click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to desc (highest first)
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1) // Reset to first page on sort
  }

  // Sort and paginate markets
  const { sortedMarkets, paginatedMarkets, totalPages } = useMemo(() => {
    let sorted = [...markets]

    if (sortField) {
      sorted.sort((a, b) => {
        let comparison = 0

        switch (sortField) {
          case 'title':
            comparison = a.title.localeCompare(b.title)
            break
          case 'price':
            comparison = getMarketPrice(a) - getMarketPrice(b)
            break
          case 'volume':
            comparison = (a.volume_24h || 0) - (b.volume_24h || 0)
            break
          case 'source':
            comparison = a.source.localeCompare(b.source)
            break
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginated = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return { sortedMarkets: sorted, paginatedMarkets: paginated, totalPages }
  }, [markets, sortField, sortDirection, currentPage])

  // Reset page when markets change
  useMemo(() => {
    setCurrentPage(1)
  }, [markets.length])

  if (markets.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-paper rounded-card shadow-card p-8 text-center">
        <p className="text-textSecondary-light dark:text-textSecondary-dark">No markets found</p>
      </div>
    )
  }

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, markets.length)

  return (
    <div className="bg-white dark:bg-dark-paper rounded-card shadow-card overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-lighter">
        <h3 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          Markets
        </h3>
        <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-0.5">
          {markets.length} markets available
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-dark-lighter">
              <th 
                className="text-left px-5 py-3 text-xs font-semibold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors select-none"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Market
                  <SortIcon field="title" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="text-right px-5 py-3 text-xs font-semibold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors select-none"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-1">
                  Price
                  <SortIcon field="price" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="text-right px-5 py-3 text-xs font-semibold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors select-none"
                onClick={() => handleSort('volume')}
              >
                <div className="flex items-center justify-end gap-1">
                  Volume
                  <SortIcon field="volume" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="text-center px-5 py-3 text-xs font-semibold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors select-none"
                onClick={() => handleSort('source')}
              >
                <div className="flex items-center justify-center gap-1">
                  Source
                  <SortIcon field="source" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-lighter">
            {paginatedMarkets.map((market) => {
              const topContract = market.contracts?.[0]
              const isSelected = selectedMarket?.market_id === market.market_id
              const price = topContract?.yes_price || 0
              const normalizedPrice = price > 1 ? price / 100 : price
              const priceColor = normalizedPrice >= 0.7 ? 'text-success' : normalizedPrice >= 0.3 ? 'text-warning' : 'text-error'

              return (
                <tr
                  key={market.market_id}
                  onClick={() => onSelectMarket(market)}
                  className={`
                    cursor-pointer transition-colors
                    hover:bg-gray-50 dark:hover:bg-dark-lighter
                    ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}
                  `}
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark line-clamp-1">
                      {market.title}
                    </p>
                    <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-0.5">
                      {market.category}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {topContract && (
                      <span className={`text-sm font-semibold ${priceColor}`}>
                        {formatPrice(topContract.yes_price)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                      {formatVolume(market.volume_24h || 0)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`
                        inline-flex px-2.5 py-1 text-xs font-medium rounded-md
                        ${market.source === 'kalshi'
                          ? 'bg-info/10 text-info'
                          : 'bg-success/10 text-success'
                        }
                      `}
                    >
                      {market.source === 'kalshi' ? 'Kalshi' : 'Polymarket'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-dark-lighter flex items-center justify-between">
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
            Showing {startItem}-{endItem} of {markets.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-lighter disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-textSecondary-light dark:text-textSecondary-dark" />
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`
                      w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-lighter text-textSecondary-light dark:text-textSecondary-dark'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-lighter disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-textSecondary-light dark:text-textSecondary-dark" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
