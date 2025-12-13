import { createServiceClient } from "@/lib/supabase"
import Dashboard from "@/components/Dashboard"
import DashboardLayout from "@/components/DashboardLayout"

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
  const supabase = createServiceClient()

  const { data: marketsData, error: marketsError } = await supabase
    .from("markets")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200)

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

interface PageProps {
  searchParams: Promise<{ source?: string; q?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const source = params.source || 'all'
  const markets = await getMarkets()

  const kalshiCount = markets.filter(m => m.source === 'kalshi').length
  const polymarketCount = markets.filter(m => m.source === 'polymarket').length

  // Dynamic title based on source filter
  const getTitle = () => {
    switch (source) {
      case 'kalshi':
        return 'Kalshi Markets'
      case 'polymarket':
        return 'Polymarket Markets'
      default:
        return 'All Markets'
    }
  }

  const getSubtitle = () => {
    switch (source) {
      case 'kalshi':
        return `${kalshiCount} prediction markets from Kalshi`
      case 'polymarket':
        return `${polymarketCount} prediction markets from Polymarket`
      default:
        return 'Real-time prediction markets from Kalshi and Polymarket'
    }
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          {getTitle()}
        </h1>
        <p className="text-textSecondary-light dark:text-textSecondary-dark mt-1">
          {getSubtitle()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-dark-paper rounded-card shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">Total Markets</p>
              <p className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark mt-1">
                {markets.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-paper rounded-card shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">Kalshi Markets</p>
              <p className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark mt-1">
                {kalshiCount}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-info/10 text-info">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-paper rounded-card shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">Polymarket</p>
              <p className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark mt-1">
                {polymarketCount}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success/10 text-success">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-paper rounded-card shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">Last Updated</p>
              <p className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark mt-1">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Markets Dashboard */}
      <Dashboard initialMarkets={markets} />
    </DashboardLayout>
  )
}
