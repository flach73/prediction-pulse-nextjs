'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { MarketWithPrice, PricePoint, FilterState } from '@/lib/types'
import { Header } from '@/components/Header'
import { StatsBar } from '@/components/StatsBar'
import { Filters } from '@/components/Filters'
import { MarketTable } from '@/components/MarketTable'
import { PriceChart } from '@/components/PriceChart'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Dashboard() {
  const [markets, setMarkets] = useState<MarketWithPrice[]>([])
  const [filteredMarkets, setFilteredMarkets] = useState<MarketWithPrice[]>([])
  const [selectedMarket, setSelectedMarket] = useState<MarketWithPrice | null>(null)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  
  const [filters, setFilters] = useState<FilterState>({
    source: 'all',
    category: '',
    status: 'all',
    search: '',
  })

  const fetchMarkets = useCallback(async () => {
    try {
      const { data: marketsData, error: marketsError } = await supabase
        .from('markets')
        .select('*')
        .order('updated_at', { ascending: false })

      if (marketsError) throw marketsError

      if (!marketsData || marketsData.length === 0) {
        setMarkets([])
        setFilteredMarkets([])
        setLoading(false)
        return
      }

      const marketIds = marketsData.map(m => m.id)
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .in('market_id', marketIds)

      if (contractsError) throw contractsError

      const contractIds = contractsData?.map(c => c.id) || []
      let latestPrices: Record<number, any> = {}
      
      if (contractIds.length > 0) {
        const { data: pricesData, error: pricesError } = await supabase
          .from('prices')
          .select('*')
          .in('contract_id', contractIds)
          .order('timestamp', { ascending: false })

        if (pricesError) throw pricesError

        pricesData?.forEach(price => {
          if (!latestPrices[price.contract_id]) {
            latestPrices[price.contract_id] = price
          }
        })
      }

      const combined: MarketWithPrice[] = marketsData.map(market => {
        const contract = contractsData?.find(c => c.market_id === market.id)
        const price = contract ? latestPrices[contract.id] : null

        return {
          ...market,
          contract_id: contract?.id || 0,
          contract_ticker: contract?.contract_ticker || '',
          bid_price: price?.bid_price || null,
          ask_price: price?.ask_price || null,
          last_price: price?.last_price || null,
          volume_24h: price?.volume_24h || null,
          price_timestamp: price?.timestamp || null,
        }
      })

      const uniqueCategories = [...new Set(combined.map(m => m.category).filter(Boolean))] as string[]
      setCategories(uniqueCategories.sort())
      setMarkets(combined)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching markets:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let result = [...markets]

    if (filters.source !== 'all') {
      result = result.filter(m => m.source === filters.source)
    }
    if (filters.category) {
      result = result.filter(m => m.category === filters.category)
    }
    if (filters.status !== 'all') {
      result = result.filter(m => m.status === filters.status)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(m => 
        m.title.toLowerCase().includes(search) ||
        m.contract_ticker.toLowerCase().includes(search)
      )
    }

    result.sort((a, b) => (b.last_price || 0) - (a.last_price || 0))
    setFilteredMarkets(result)
  }, [markets, filters])

  const fetchPriceHistory = useCallback(async (contractId: number) => {
    setChartLoading(true)
    try {
      const { data, error } = await supabase
        .from('prices')
        .select('timestamp, last_price')
        .eq('contract_id', contractId)
        .order('timestamp', { ascending: true })
        .limit(500)

      if (error) throw error

      const history: PricePoint[] = data
        ?.filter(p => p.last_price !== null)
        .map(p => ({
          timestamp: p.timestamp,
          price: p.last_price!,
        })) || []

      setPriceHistory(history)
    } catch (error) {
      console.error('Error fetching price history:', error)
      setPriceHistory([])
    } finally {
      setChartLoading(false)
    }
  }, [])

  const handleSelectMarket = useCallback((market: MarketWithPrice) => {
    setSelectedMarket(market)
    if (market.contract_id) {
      fetchPriceHistory(market.contract_id)
    }
  }, [fetchPriceHistory])

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  const stats = {
    total: markets.length,
    kalshi: markets.filter(m => m.source === 'kalshi').length,
    polymarket: markets.filter(m => m.source === 'polymarket').length,
    active: markets.filter(m => m.status === 'open').length,
  }

  return (
    <div className="min-h-screen">
      <Header lastUpdate={lastUpdate} onRefresh={fetchMarkets} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <StatsBar stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Filters 
                  filters={filters} 
                  setFilters={setFilters}
                  categories={categories}
                />
                <MarketTable 
                  markets={filteredMarkets}
                  selectedMarket={selectedMarket}
                  onSelectMarket={handleSelectMarket}
                />
              </div>
              
              <div className="lg:col-span-1">
                <PriceChart 
                  market={selectedMarket}
                  priceHistory={priceHistory}
                  loading={chartLoading}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}