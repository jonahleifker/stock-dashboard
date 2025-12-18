---
date: 2024-12-17
researcher: Claude
topic: "Stock Dashboard Codebase Overview"
tags: [research, codebase, stock-trading, swing-trading, dashboard]
status: complete
---

# Research: Stock Dashboard Codebase Overview

## Research Question
Tell me about the content of this codebase and what its use case is.

## Summary
This codebase is a **Stock Trading Dashboard** application designed for **swing trading analysis**. It provides a web-based interface for tracking stock price pullbacks, sector performance, deep pullbacks, and IPO performance. The application consists of a Python Flask backend that fetches real-time stock data via the Yahoo Finance API (`yfinance`) and serves it to standalone HTML frontends built with React and Tailwind CSS.

The primary use case is to help traders identify potential **buying opportunities** by monitoring stocks that have pulled back significantly from their recent highs - a common swing trading strategy. The dashboard tracks Fortune 100 companies and provides multiple analytical views including pullback opportunities, sector heat maps, extreme pullbacks (50%+ drops), and recent IPO performance tracking.

## Detailed Findings

### Architecture Overview

The application follows a simple client-server architecture:

1. **Backend**: Python Flask server (`server.py`) running on `localhost:8000`
2. **Frontend**: Standalone HTML files with embedded React components using CDN-loaded libraries
3. **Data Source**: Yahoo Finance API via `yfinance` Python library

### Backend API (`server.py`)

The Flask backend provides four main REST API endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/api/stocks` | Get pullback data for Fortune 100 stocks (30-day high comparison) |
| `/api/sectors` | Get sector performance analysis across 200+ stocks |
| `/api/deep-pullbacks` | Find stocks down 50%+ from their highs |
| `/api/ipos` | Track recent IPO performance (last 5 years) |

**Stock Lists:**
- `TICKERS`: 60 Fortune 100 public company tickers
- `EXPANDED_TICKERS`: 200+ stocks covering all 11 market sectors
- `RECENT_IPOS`: 26 notable IPOs from 2019-2024

### Frontend Components

#### 1. `stock-dashboard-with-tabs.html` (Simpler Version)
A two-tab dashboard with:
- **Pullbacks Tab**: Shows Fortune 100 stocks sorted by distance from 30-day high
- **Hot Sectors Tab**: Displays sector performance with expandable stock lists

#### 2. `trading-dashboard-final.html` (Full Version)
A four-tab comprehensive dashboard with:
- **Pullbacks Tab**: Standard pullback opportunities (10%+ down = opportunity)
- **Deep (50%+) Tab**: Extreme pullbacks across 3mo/6mo/1yr timeframes
- **IPOs Tab**: Recent IPO performance with winners/losers tracking
- **Sectors Tab**: Hot sector analysis with 7d/30d/90d timeframes

### Frontend Technology Stack

Both HTML files use:
- **React 18** (CDN: unpkg.com)
- **Babel Standalone** (for JSX transformation in-browser)
- **Tailwind CSS** (CDN: cdn.tailwindcss.com)

The frontends are fully self-contained single-file applications with no build step required.

### Next.js Frontend (Incomplete)

The `frontend/` directory contains:
- A Next.js project setup with `.next/` build artifacts
- `node_modules/` with shadcn/ui components installed (radix-ui, lucide-react, tailwind-merge, class-variance-authority)
- **No source files present** - appears to be an incomplete or abandoned migration attempt

Based on the `.next` build artifacts, there was an `app/page.tsx` that used shadcn components (Card, Button, Input, Badge, Table) for a more polished UI, but the source files have been removed or never committed.

### Key Features

1. **Pullback Detection**
   - Calculates percentage drop from 30-day high
   - Highlights opportunities (stocks down 10%+ from high)
   - Color-coded badges for visual priority

2. **Sector Analysis**
   - Groups stocks by market sector
   - Calculates average performance per sector
   - Supports 7-day, 30-day, and 90-day timeframes
   - Ranks sectors from hottest to coldest

3. **Deep Pullback Scanner**
   - Identifies extreme value opportunities
   - Tracks drops from 3-month, 6-month, and 1-year highs
   - Only includes stocks down 50%+ from highs
   - Shows market cap for quality filtering

4. **IPO Tracker**
   - Monitors recent IPO performance
   - Calculates return since IPO price
   - Tracks "winners" (positive) and "big winners" (100%+)
   - Includes IPO date and age

### Data Flow

```
1. User clicks "Refresh" button
2. Frontend makes HTTP GET request to Flask API
3. Flask server iterates through stock tickers
4. yfinance fetches historical data from Yahoo Finance
5. Server calculates metrics (highs, % changes, averages)
6. JSON response returned to frontend
7. React components render data in tables/cards
```

### Dependencies

**Backend:**
- `flask` - Web framework
- `flask-cors` - Cross-origin resource sharing
- `yfinance` - Yahoo Finance API wrapper

**Frontend (Next.js - if completed):**
- `next` - React framework
- `@radix-ui/react-*` - Headless UI primitives
- `lucide-react` - Icons
- `tailwind-merge` - Tailwind class merging
- `class-variance-authority` - Component variant management
- `clsx` - Conditional class names
- `tw-animate-css` - Tailwind animations

## Code References

- `server.py:1-382` - Complete Flask backend implementation
- `server.py:8-16` - Fortune 100 ticker list
- `server.py:59-104` - Expanded sector ticker list (200+ stocks)
- `server.py:282-322` - Recent IPO tracking list
- `server.py:18-57` - `/api/stocks` endpoint (pullback data)
- `server.py:106-209` - `/api/sectors` endpoint (sector analysis)
- `server.py:211-278` - `/api/deep-pullbacks` endpoint (50%+ drops)
- `server.py:324-377` - `/api/ipos` endpoint (IPO tracking)
- `stock-dashboard-with-tabs.html:1-240` - Simple two-tab dashboard
- `trading-dashboard-final.html:1-366` - Full four-tab dashboard

## Architecture Insights

1. **Stateless Design**: The backend is stateless - all data is fetched fresh from Yahoo Finance on each request. This ensures real-time accuracy but can be slow for sector analysis (3-5 minutes for 200+ stocks).

2. **Single-File Frontends**: The HTML dashboards are self-contained, making deployment trivial (just serve static files) but limiting for complex UI features.

3. **No Authentication**: The application has no authentication or rate limiting, designed for local/personal use only.

4. **No Caching**: Stock data is fetched on every request with no caching layer, which can be slow and may hit API rate limits.

5. **Intended Migration to Next.js**: The presence of the `frontend/` folder with shadcn components suggests a planned migration to a more sophisticated Next.js frontend with proper component architecture.

## Open Questions

1. **Why are the Next.js source files missing?** Were they deleted, never committed, or in a different branch?

2. **Is there a requirements.txt or package.json for the Python dependencies?** Currently missing from the repository.

3. **What is the intended deployment target?** Local-only or web hosting?

4. **Is there a need for data persistence?** Watchlists, alerts, or historical tracking features would benefit from a database.

## Recommendations

1. Add a `requirements.txt` for Python dependencies
2. Consider adding Redis/memory caching for the sector analysis endpoint
3. Complete the Next.js frontend migration for better UX
4. Add API rate limiting and error handling
5. Consider adding watchlist/favorites functionality
