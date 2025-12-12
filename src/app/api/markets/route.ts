import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source')
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    let query = supabase
      .from('markets')
      .select(`
        market_id,
        source,
        title,
        category,
        status,
        expiry_ts,
        updated_at,
        contracts (
          contract_id,
          ticker,
          title,
          yes_price,
          volume_24h,
          prices (
            price,
            timestamp
          )
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (source && source !== 'all') {
      query = query.eq('source', source)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ markets: data })
  } catch (error) {
    console.error('Markets API error:', error)
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 })
  }
}