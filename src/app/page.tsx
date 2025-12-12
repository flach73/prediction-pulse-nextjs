import { createClient } from "@/lib/supabase"
import Dashboard from "@/components/Dashboard"

export const revalidate = 300

interface Price {
  price: number
  timestamp: string
}

interface Contract {
  id: string
  contract_id: string
  market_id: string
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
  status: string
  volume_24h: number
  contracts?: Contract[]
}

async function getMarkets() {
  const supabase = createClient()
  
  const { data: marketsData, error: marketsError } = await supabase
    .from("markets")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50)

  if (marketsError || !marketsData) {
    console.error("Error fetching markets:", marketsError)
    return []
  }

  const markets = marketsData as Market[]
  const marketIds = markets.map(m => m.market_id)
  
  if (marketIds.length === 0) return []

  const { data: contractsData } = await supabase
    .from("contracts")
    .select("*")
    .in("market_id", marketIds)

  const contracts = (contractsData || []) as Contract[]
  const contractIds = contracts.map(c => c.contract_id)

  const { data: pricesData } = await supabase
    .from("prices")
    .select("*")
    .in("contract_id", contractIds)
    .order("timestamp", { ascending: false })

  const prices = (pricesData || []) as (Price & { contract_id: string })[]

  return markets.map(market => ({
    ...market,
    contracts: contracts
      .filter(c => c.market_id === market.market_id)
      .map(contract => ({
        ...contract,
        prices: prices.filter(p => p.contract_id === contract.contract_id)
      })),
    volume_24h: contracts
      .filter(c => c.market_id === market.market_id)
      .reduce((sum, c) => sum + (c.volume_24h || 0), 0)
  }))
}

export default async function Home() {
  const markets = await getMarkets()

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Prediction Pulse</h1>
          <p className="text-[var(--text-secondary)]">Real-time prediction markets from Kalshi and Polymarket</p>
        </header>
        <div className="flex gap-6 mb-8">
          <div className="stat-card">
            <p className="stat-label">Markets</p>
            <p className="stat-value">{markets.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Last Updated</p>
            <p className="stat-value">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <Dashboard initialMarkets={markets} />
      </div>
    </main>
  )
}
