'use client'

interface Contract {
  id: string
  contract_id: string
  ticker: string
  title: string
  yes_price: number
  volume_24h: number
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

function formatVolume(volume: number): string {
  if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
  if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`
  return `$${volume.toFixed(0)}`
}

function formatPrice(price: number): string {
  return `${(price * 100).toFixed(0)}¢`
}

export default function MarketTable({ markets, selectedMarket, onSelectMarket }: MarketTableProps) {
  if (markets.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-[var(--text-muted)]">No markets found</p>
      </div>
    )
  }

  return (
    <div className="glass-panel overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Market</th>
            <th className="text-right">Price</th>
            <th className="text-right">Volume</th>
            <th className="text-center">Source</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => {
            const topContract = market.contracts?.[0]
            const isSelected = selectedMarket?.market_id === market.market_id
            
            return (
              <tr
                key={market.market_id}
                onClick={() => onSelectMarket(market)}
                className={`cursor-pointer ${isSelected ? 'bg-[var(--accent-cyan)]/10' : ''}`}
              >
                <td>
                  <p className="text-sm text-[var(--text-primary)] line-clamp-1">{market.title}</p>
                </td>
                <td className="text-right">
                  {topContract && (
                    <span className="text-sm font-medium text-[var(--accent-emerald)]">
                      {formatPrice(topContract.yes_price)}
                    </span>
                  )}
                </td>
                <td className="text-right">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {formatVolume(market.volume_24h || 0)}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`badge ${market.source === 'kalshi' ? 'badge-kalshi' : 'badge-polymarket'}`}>
                    {market.source}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}