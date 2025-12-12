import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface KalshiMarket {
  ticker: string
  title: string
  category: string
  status: string
  close_time?: string
  yes_ask?: number
  volume_24h?: number
}

interface PolymarketMarket {
  condition_id: string
  question: string
  category?: string
  closed?: boolean
  end_date_iso?: string
  tokens?: { outcome: string; price: number }[]
  volume_24hr?: number
}

async function fetchKalshi() {
  try {
    const res = await fetch('https://api.elections.kalshi.com/trade-api/v2/markets?limit=50&status=open', {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.markets || []) as KalshiMarket[]
  } catch (e) {
    console.error('Kalshi fetch error:', e)
    return []
  }
}

async function fetchPolymarket() {
  try {
    const res = await fetch('https://gamma-api.polymarket.com/markets?closed=false&limit=50', {
      next: { revalidate: 0 }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data || []) as PolymarketMarket[]
  } catch (e) {
    console.error('Polymarket fetch error:', e)
    return []
  }
}

export async function GET(request: Request) {
  // Optional: verify cron secret in production
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow requests without auth for manual triggers
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { kalshi: 0, polymarket: 0, errors: [] as string[] }
  const now = new Date().toISOString()

  // Process Kalshi
  const kalshiMarkets = await fetchKalshi()
  for (const market of kalshiMarkets) {
    try {
      const marketRecord = {
        market_id: `kalshi_${market.ticker}`,
        source: 'kalshi' as const,
        title: market.title,
        category: market.category || 'general',
        status: market.status,
        expiry_ts: market.close_time || null,
        updated_at: now
      }

      const { data: marketData, error: marketError } = await supabase
        .from('markets')
        .upsert(marketRecord as any, { onConflict: 'market_id' })
        .select()

      if (marketError) throw marketError

      const contractRecord = {
        contract_id: `kalshi_${market.ticker}_yes`,
        market_id: `kalshi_${market.ticker}`,
        ticker: market.ticker,
        title: 'Yes',
        yes_price: market.yes_ask || 0,
        volume_24h: market.volume_24h || 0,
        updated_at: now
      }

      const { error: contractError } = await supabase
        .from('contracts')
        .upsert(contractRecord as any, { onConflict: 'contract_id' })

      if (contractError) throw contractError

      const priceRecord = {
        contract_id: `kalshi_${market.ticker}_yes`,
        price: market.yes_ask || 0,
        timestamp: now
      }

      await supabase.from('prices').insert(priceRecord as any)

      results.kalshi++
    } catch (e) {
      results.errors.push(`Kalshi ${market.ticker}: ${e}`)
    }
  }

  // Process Polymarket
  const polymarketMarkets = await fetchPolymarket()
  for (const market of polymarketMarkets) {
    try {
      const marketRecord = {
        market_id: `poly_${market.condition_id}`,
        source: 'polymarket' as const,
        title: market.question,
        category: market.category || 'general',
        status: market.closed ? 'closed' : 'open',
        expiry_ts: market.end_date_iso || null,
        updated_at: now
      }

      const { error: marketError } = await supabase
        .from('markets')
        .upsert(marketRecord as any, { onConflict: 'market_id' })

      if (marketError) throw marketError

      const yesToken = market.tokens?.find(t => t.outcome === 'Yes')
      const price = yesToken?.price || 0

      const contractRecord = {
        contract_id: `poly_${market.condition_id}_yes`,
        market_id: `poly_${market.condition_id}`,
        ticker: market.condition_id,
        title: 'Yes',
        yes_price: price,
        volume_24h: market.volume_24hr || 0,
        updated_at: now
      }

      const { error: contractError } = await supabase
        .from('contracts')
        .upsert(contractRecord as any, { onConflict: 'contract_id' })

      if (contractError) throw contractError

      const priceRecord = {
        contract_id: `poly_${market.condition_id}_yes`,
        price: price,
        timestamp: now
      }

      await supabase.from('prices').insert(priceRecord as any)

      results.polymarket++
    } catch (e) {
      results.errors.push(`Polymarket ${market.condition_id}: ${e}`)
    }
  }

  return NextResponse.json({
    success: true,
    ingested: results,
    timestamp: now
  })
}
