import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prediction Pulse | Real-Time Market Odds',
  description: 'Live prediction market data aggregated from Kalshi and Polymarket',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen grid-pattern">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}