import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || process.env.NODE_ENV === 'development') {
    return true
  }
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const results = {
    kalshi: { success: false, markets: 0, error: null as string | null },
    polymarket: { success: false, markets: 0, error: null as string | null },
  }

  try {
    const kalshiMarkets = await fetchKalshiMarkets()
    const kalshiCount = await ingestMarkets(supabase, kalshiMarkets, 'kalshi')
    results.kalshi = { success: true, markets: kalshiCount, error: null }
  } catch (error) {
    results.kalshi.error = error instanceof Error ? error.message : 'Unknown error'
  }

  try {
    const polymarketMarkets = await fetchPolymarketMarkets()
    const polyCount = await ingestMarkets(supabase, polymarketMarkets, 'polymarket')
    results.polymarket = { success: true, markets: polyCount, error: null }
  } catch (error) {
    results.polymarket.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json({
    success: results.kalshi.success || results.polymarket.success,
    timestamp: new Date().toISOString(),
    totalMarkets: results.kalshi.markets + results.polymarket.markets,
    results,
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}

async function fetchKalshiMarkets(): Promise<NormalizedMarket[]> {
  const response = await fetch(
    'https://api.elections.kalshi.com/trade-api/v2/markets?limit=100&status=open',
    { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
  )
  if (!response.ok) throw new Error(`Kalshi API error: ${response.status}`)
  const data = await response.json()
  return (data.markets || []).map((m: any) => ({
    market_id: m.ticker,
    source: 'kalshi' as const,
    title: m.title || m.subtitle || m.ticker,
    category: m.category || 'Uncategorized',
    status: m.status || 'open',
    expiry_ts: m.close_time || null,
    contract_ticker: m.ticker,
    bid_price: m.yes_bid ?? null,
    ask_price: m.yes_ask ?? null,
    last_price: m.last_price ?? null,
    volume_24h: m.volume_24h ?? null,
  }))
}

async function fetchPolymarketMarkets(): Promise<NormalizedMarket[]> {
  const response = await fetch(
    'https://gamma-api.polymarket.com/markets?closed=false&limit=100&order=volume&ascending=false',
    { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
  )
  if (!response.ok) throw new Error(`Polymarket API error: ${response.status}`)
  const markets = await response.json()
  return markets.map((m: any) => {
    let lastPrice = null
    try {
      if (m.outcomePrices) {
        const prices = JSON.parse(m.outcomePrices)
        lastPrice = prices[0] * 100
      }
    } catch {}
    return {
      market_id: m.id || m.conditionId,
      source: 'polymarket' as const,
      title: m.question || m.title,
      category: m.category || 'Uncategorized',
      status: m.closed ? 'closed' : 'open',
      expiry_ts: m.endDate || null,
      contract_ticker: m.slug || m.id,
      bid_price: null,
      ask_price: null,
      last_price: lastPrice,
      volume_24h: m.volume ? parseFloat(m.volume) : null,
    }
  })
}

interface NormalizedMarket {
  market_id: string
  source: 'kalshi' | 'polymarket'
  title: string
  category: string
  status: string
  expiry_ts: string | null
  contract_ticker: string
  bid_price: number | null
  ask_price: number | null
  last_price: number | null
  volume_24h: number | null
}

async function ingestMarkets(
  supabase: ReturnType<typeof createServerClient>,
  markets: NormalizedMarket[],
  source: string
): Promise<number> {
  let count = 0
  for (const market of markets) {
    try {
      const { data: marketData, error: marketError } = await supabase
        .from('markets')
        .upsert({
          market_id: market.market_id,
          source: market.source,
          title: market.title,
          category: market.category,
          status: market.status,
          expiry_ts: market.expiry_ts,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'source,market_id' })
        .select()
        .single()

      if (marketError) continue

      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .upsert({
          contract_ticker: market.contract_ticker,
          market_id: marketData.id,
          side: 'YES',
        }, { onConflict: 'contract_ticker,market_id' })
        .select()
        .single()

      if (contractError) continue

      await supabase.from('prices').insert({
        contract_id: contractData.id,
        bid_price: market.bid_price,
        ask_price: market.ask_price,
        last_price: market.last_price,
        volume_24h: market.volume_24h,
      })

      count++
    } catch (error) {
      console.error(`Error processing ${market.market_id}:`, error)
    }
  }
  return count
}