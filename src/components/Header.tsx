'use client'

import { Activity, RefreshCw, Github } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  lastUpdate: Date | null
  onRefresh: () => void
}

export function Header({ lastUpdate, onRefresh }: HeaderProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <header className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-slate-900" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Prediction Pulse</h1>
              <p className="text-xs text-slate-500">Real-time market odds</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-xs text-slate-500 hidden sm:block">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RefreshCw className={refreshing ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              href="https://github.com/flach73/prediction-pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
