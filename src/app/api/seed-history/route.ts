import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('contract_id, yes_price')

    if (contractsError || !contracts) {
      return NextResponse.json({ error: contractsError?.message }, { status: 500 })
    }

    const prices: { contract_id: string; price: number; timestamp: string }[] = []
    const now = new Date()

    for (const contract of contracts) {
      const basePrice = contract.yes_price || 50
      
      for (let i = 120; i >= 1; i--) {
        const timestamp = new Date(now.getTime() - i * 6 * 60 * 60 * 1000)
        const variance = (Math.random() - 0.5) * 20
        const trendFactor = (120 - i) / 120
        const historicalPrice = basePrice + variance * (1 - trendFactor) - (basePrice - contract.yes_price) * trendFactor
        const clampedPrice = Math.max(1, Math.min(99, Math.round(historicalPrice)))
        
        prices.push({
          contract_id: contract.contract_id,
          price: clampedPrice,
          timestamp: timestamp.toISOString()
        })
      }
    }

    let inserted = 0
    for (let i = 0; i < prices.length; i += 500) {
      const batch = prices.slice(i, i + 500)
      const { error } = await supabase.from('prices').insert(batch)
      if (!error) inserted += batch.length
    }

    return NextResponse.json({
      success: true,
      contracts: contracts.length,
      pricesInserted: inserted
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}