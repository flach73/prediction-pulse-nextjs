'use client'

import { Search } from 'lucide-react'
import type { FilterState } from '@/lib/types'

interface FiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  categories: string[]
}

export function Filters({ filters, setFilters, categories }: FiltersProps) {
  return (
    <div className="glass-panel p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search markets..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="input-field pl-10"
          />
        </div>

        <select
          value={filters.source}
          onChange={(e) => setFilters(f => ({ ...f, source: e.target.value as FilterState['source'] }))}
          className="input-field sm:w-40"
        >
          <option value="all">All Sources</option>
          <option value="kalshi">Kalshi</option>
          <option value="polymarket">Polymarket</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          className="input-field sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as FilterState['status'] }))}
          className="input-field sm:w-32"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>
  )
}