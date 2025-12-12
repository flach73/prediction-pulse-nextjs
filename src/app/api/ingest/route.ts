import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function fetchKalshi() {
  try {
    const res = await fetch('https://api.elections.kalshi.com/trade-api/v2/markets?limit=50&status=open', {
      headers: { 'Accept': 'application/json' }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.markets || []
  } catch {
    return []
  }
}

async function fetchPolymarket() {
  try {
    const res = await fetch('https://gamma-api.polymarket.com/markets?closed=false&limit=50')
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const now = new Date().toISOString()
  const results = { kalshi: 0, polymarket: 0, errors: [] as string[] }

  const kalshiMarkets = await fetchKalshi()
  for (const market of kalshiMarkets) {
    try {
      const marketId = `kalshi_${market.ticker}`
      
      const { error: marketError } = await supabase
        .from('markets')
        .upsert({
          market_id: marketId,
          source: 'kalshi',
          title: market.title || market.ticker,
          category: market.category || 'general',
          status: market.status || 'open',
          expiry_ts: market.close_time || null,
          updated_at: now
        }, { onConflict: 'market_id' })

      if (marketError) {
        results.errors.push(`Kalshi market ${market.ticker}: ${marketError.message}`)
        continue
      }

      const contractId = `${marketId}_yes`
      const yesPrice = market.yes_ask || market.last_price || 0

      const { error: contractError } = await supabase
        .from('contracts')
        .upsert({
          contract_id: contractId,
          market_id: marketId,
          ticker: market.ticker,
          title: 'Yes',
          yes_price: yesPrice,
          volume_24h: market.volume_24h || 0,
          updated_at: now
        }, { onConflict: 'contract_id' })

      if (contractError) {
        results.errors.push(`Kalshi contract ${market.ticker}: ${contractError.message}`)
        continue
      }

      await supabase.from('prices').insert({
        contract_id: contractId,
        price: yesPrice,
        timestamp: now
      })

      results.kalshi++
    } catch (e: any) {
      results.errors.push(`Kalshi ${market.ticker}: ${e?.message || 'Unknown error'}`)
    }
  }

  const polymarketMarkets = await fetchPolymarket()
  for (const market of polymarketMarkets) {
    try {
      const polyId = market.id || market.condition_id || market.questionID
      if (!polyId) {
        results.errors.push(`Polymarket: missing ID`)
        continue
      }
      
      const marketId = `poly_${polyId}`

      const { error: marketError } = await supabase
        .from('markets')
        .upsert({
          market_id: marketId,
          source: 'polymarket',
          title: market.question || market.title || 'Unknown',
          category: market.category || 'general',
          status: market.closed ? 'closed' : 'open',
          expiry_ts: market.endDate || null,
          updated_at: now
        }, { onConflict: 'market_id' })

      if (marketError) {
        results.errors.push(`Poly market ${polyId}: ${marketError.message}`)
        continue
      }

      let yesPrice = 0
      try {
        if (market.outcomePrices) {
          yesPrice = JSON.parse(market.outcomePrices)[0]
        } else {
          yesPrice = market.bestAsk || market.lastTradePrice || 0
        }
      } catch {
        yesPrice = 0
      }

      const contractId = `${marketId}_yes`

      const { error: contractError } = await supabase
        .from('contracts')
        .upsert({
          contract_id: contractId,
          market_id: marketId,
          ticker: polyId,
          title: 'Yes',
          yes_price: parseFloat(yesPrice) || 0,
          volume_24h: parseFloat(market.volume24hr || market.volume || 0),
          updated_at: now
        }, { onConflict: 'contract_id' })

      if (contractError) {
        results.errors.push(`Poly contract ${polyId}: ${contractError.message}`)
        continue
      }

      await supabase.from('prices').insert({
        contract_id: contractId,
        price: parseFloat(yesPrice) || 0,
        timestamp: now
      })

      results.polymarket++
    } catch (e: any) {
      results.errors.push(`Polymarket: ${e?.message || 'Unknown error'}`)
    }
  }

  return NextResponse.json({
    success: true,
    ingested: results,
    timestamp: now
  })
}