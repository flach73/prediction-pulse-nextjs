export interface Database {
  public: {
    Tables: {
      markets: {
        Row: Market
        Insert: Omit<Market, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Market, 'id'>>
      }
      contracts: {
        Row: Contract
        Insert: Omit<Contract, 'id' | 'created_at'>
        Update: Partial<Omit<Contract, 'id'>>
      }
      prices: {
        Row: Price
        Insert: Omit<Price, 'id'>
        Update: Partial<Omit<Price, 'id'>>
      }
    }
  }
}

export interface Market {
  id: number
  market_id: string
  source: 'kalshi' | 'polymarket'
  title: string
  category: string | null
  status: string
  expiry_ts: string | null
  created_at: string
  updated_at: string
}

export interface Contract {
  id: number
  contract_ticker: string
  market_id: number
  side: string
  created_at: string
}

export interface Price {
  id: number
  contract_id: number
  timestamp: string
  bid_price: number | null
  ask_price: number | null
  last_price: number | null
  volume_24h: number | null
}

export interface MarketWithPrice extends Market {
  contract_id: number
  contract_ticker: string
  bid_price: number | null
  ask_price: number | null
  last_price: number | null
  volume_24h: number | null
  price_timestamp: string | null
}

export interface PricePoint {
  timestamp: string
  price: number
}

export interface FilterState {
  source: 'all' | 'kalshi' | 'polymarket'
  category: string
  status: 'all' | 'open' | 'closed'
  search: string
}