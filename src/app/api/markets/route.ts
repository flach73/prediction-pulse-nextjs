import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source')
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    let query = supabase
      .from('markets')
      .select('*, contracts(id, contract_ticker, side)')
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ markets: data })
  } catch (error) {
    console.error('Markets API error:', error)
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 })
  }
}