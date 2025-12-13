# Prediction Pulse 📊

Real-time prediction markets dashboard aggregating data from Kalshi and Polymarket.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://prediction-pulse-nextjs.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)

![Prediction Pulse Dashboard](screenshot.png)

## 🎯 What It Does

Prediction Pulse pulls live market data from two major prediction platforms and displays them in a unified dashboard:

- **Kalshi** - US-regulated prediction exchange
- **Polymarket** - Crypto-based prediction market

Track probabilities, view price history, and compare markets across both platforms in one place.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Unified Feed** | Markets from Kalshi & Polymarket in one view |
| **Sortable Columns** | Sort by price, volume, name, or source |
| **Pagination** | Navigate large market lists (10 per page) |
| **Price Charts** | Interactive area charts with price history |
| **Time Range Toggle** | Switch between 24H / 7D / 30D views |
| **Price Arrows** | Visual trend indicators (↑↓) with % change |
| **Search & Filter** | Find markets by keyword, filter by platform |
| **Dark Mode** | Full dark theme support |

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vuexy Design System
- **Database:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Vercel

## 🚀 Live Demo

**[→ prediction-pulse-nextjs.vercel.app](https://prediction-pulse-nextjs.vercel.app)**

## 📦 Local Setup

```bash
# Clone the repo
git clone https://github.com/flach73/prediction-pulse-nextjs.git
cd prediction-pulse-nextjs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔧 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # API routes (data ingestion)
│   ├── page.tsx      # Main dashboard page
│   └── globals.css   # Global styles + Vuexy theme
├── components/
│   ├── Dashboard.tsx      # Main layout orchestrator
│   ├── MarketTable.tsx    # Sortable, paginated table
│   ├── PriceChart.tsx     # Area chart with time ranges
│   ├── Sidebar.tsx        # Navigation + filters
│   ├── Navbar.tsx         # Search bar
│   └── Card.tsx           # Reusable card components
└── lib/
    └── supabase.ts        # Database client
```

## 📊 Data Pipeline

1. **Ingest** - API routes fetch from Kalshi & Polymarket APIs
2. **Normalize** - Standardize price formats (Polymarket 0-1 → percentage)
3. **Store** - Persist to Supabase PostgreSQL
4. **Display** - Real-time queries to frontend

## 🗺 Roadmap

- [ ] Auto-refresh (live updates every 60s)
- [ ] Market detail pages
- [ ] Favorites/Watchlist
- [ ] Category filters (Politics, Crypto, Sports)
- [ ] Export to CSV
- [ ] Mobile responsive improvements

## 👤 Author

**Oleg Flach**

- GitHub: [@flach73](https://github.com/flach73)
- Business: TFBE Global

---

## 📄 License

MIT © 2025 Prediction Pulse
