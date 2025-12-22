# API Optimization & Supabase Caching Implementation Plan

## Overview
Optimize stock data fetching by replacing 200+ individual Yahoo Finance API calls with 1-2 batched calls using `yf.download()`, and add Supabase persistence to cache results with UPSERT operations.

## Current State
- **Problem**: Each endpoint loops through tickers making individual `yf.Ticker(ticker).history()` calls
- **Impact**: `/api/sectors` takes 3-5 minutes (200+ API calls)
- **No caching**: Data is fetched fresh on every request

## Desired End State
- **Batched fetching**: Single `yf.download()` call for all price data
- **Supabase caching**: Stock metadata and prices stored in database
- **Fast responses**: Return cached data immediately, refresh in background or on-demand
- **Verification**: API response time under 5 seconds for cached data

## What We're NOT Doing
- Modifying the frontend HTML files
- Adding background refresh/cron jobs (future enhancement)
- Historical data tracking (only current snapshot)
- Authentication or rate limiting

## Implementation Approach
1. Create two Supabase tables: static metadata + dynamic prices
2. Refactor `server.py` to use `yf.download()` for batched API calls
3. Add Supabase client for UPSERT operations
4. Modify endpoints to read from cache, write on refresh

---

## Phase 1: Supabase Database Setup

### Overview
Create two tables in Supabase to separate static data (company name, sector) from dynamic data (prices).

### Changes Required

#### 1. Create `stock_metadata` Table
**Purpose**: Store company names and sectors (rarely changes)

```sql
CREATE TABLE stock_metadata (
    ticker TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    sector TEXT DEFAULT 'Unknown',
    market_cap BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow all operations for now
ALTER TABLE stock_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON stock_metadata FOR ALL USING (true);
```

#### 2. Create `stock_prices` Table
**Purpose**: Store current price data (updates on each refresh)

```sql
CREATE TABLE stock_prices (
    ticker TEXT PRIMARY KEY REFERENCES stock_metadata(ticker),
    current_price DECIMAL(12,2),
    high_30d DECIMAL(12,2),
    high_3mo DECIMAL(12,2),
    high_6mo DECIMAL(12,2),
    high_1yr DECIMAL(12,2),
    change_7d DECIMAL(8,2),
    change_30d DECIMAL(8,2),
    change_90d DECIMAL(8,2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON stock_prices FOR ALL USING (true);
```

### Success Criteria
- [ ] Both tables exist in Supabase
- [ ] Can insert/query data via Supabase dashboard

---

## Phase 2: Backend Refactoring

### Overview
Update `server.py` to use batched yfinance calls and Supabase for storage.

### Changes Required

#### 1. Add Dependencies
**File**: `requirements.txt` (create new)

```
flask
flask-cors
yfinance
supabase
python-dotenv
```

#### 2. Add Environment Config
**File**: `.env` (create new)

```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
```

#### 3. Refactor `server.py`

**Add imports and Supabase client at top:**

```python
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import yfinance as yf
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)
```

**Add helper function for batched price fetching:**

```python
def fetch_prices_batched(tickers: list, period: str = '3mo') -> dict:
    """Fetch price data for all tickers in ONE API call."""
    print(f"Fetching {len(tickers)} tickers in batch...")
    
    data = yf.download(tickers, period=period, group_by='ticker', progress=False)
    
    results = {}
    for ticker in tickers:
        try:
            if ticker in data.columns.get_level_values(0):
                ticker_data = data[ticker]
                if not ticker_data.empty:
                    results[ticker] = {
                        'current_price': float(ticker_data['Close'].iloc[-1]),
                        'high_30d': float(ticker_data['High'].iloc[-22:].max()) if len(ticker_data) >= 22 else float(ticker_data['High'].max()),
                        'high_3mo': float(ticker_data['High'].max()),
                    }
        except Exception as e:
            print(f"Error processing {ticker}: {e}")
    
    return results
```

**Add helper for metadata (still needs individual calls):**

```python
def fetch_metadata_for_ticker(ticker: str) -> dict:
    """Fetch company metadata for a single ticker."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            'ticker': ticker,
            'company': info.get('longName', info.get('shortName', ticker)),
            'sector': info.get('sector', 'Unknown'),
            'market_cap': info.get('marketCap', 0)
        }
    except:
        return {'ticker': ticker, 'company': ticker, 'sector': 'Unknown', 'market_cap': 0}
```

**Refactor `/api/stocks` endpoint:**

```python
@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    # Try to get cached data first
    cached = supabase.table('stock_prices').select(
        'ticker, current_price, high_30d, stock_metadata(company, sector)'
    ).execute()
    
    if cached.data and len(cached.data) > 0:
        # Return cached data with freshness info
        results = []
        for row in cached.data:
            meta = row.get('stock_metadata', {})
            results.append({
                'ticker': row['ticker'],
                'company': meta.get('company', row['ticker']),
                'currentPrice': float(row['current_price']),
                'highLast30Days': float(row['high_30d']),
                'sector': meta.get('sector', 'Unknown')
            })
        return jsonify(results)
    
    # No cache - fetch fresh (this path used on first run or force refresh)
    return refresh_stocks()

@app.route('/api/stocks/refresh', methods=['POST'])
def refresh_stocks():
    """Force refresh stock data from Yahoo Finance."""
    # Batch fetch prices (1 API call!)
    prices = fetch_prices_batched(TICKERS, period='1mo')
    
    # Update Supabase
    for ticker, price_data in prices.items():
        # Ensure metadata exists
        meta = fetch_metadata_for_ticker(ticker)
        supabase.table('stock_metadata').upsert(meta).execute()
        
        # Update prices
        supabase.table('stock_prices').upsert({
            'ticker': ticker,
            'current_price': price_data['current_price'],
            'high_30d': price_data['high_30d'],
            'updated_at': 'now()'
        }).execute()
    
    # Return fresh data
    return get_stocks()
```

### Success Criteria

#### Automated Verification:
- [ ] Server starts without errors: `python server.py`
- [ ] No import errors for supabase client

#### Manual Verification:
- [ ] `GET /api/stocks` returns data (from cache or fresh)
- [ ] `POST /api/stocks/refresh` fetches new data and updates Supabase
- [ ] Supabase dashboard shows populated tables
- [ ] Response time < 5 seconds for cached data

---

## Testing Strategy

### Manual Testing Steps
1. Start server: `python server.py`
2. First call `GET /api/stocks` - should fetch fresh (slow, ~30s for 60 tickers)
3. Check Supabase dashboard - tables should have data
4. Second call `GET /api/stocks` - should return cached (fast, <1s)
5. Call `POST /api/stocks/refresh` - should update data
6. Verify `updated_at` timestamp changed in Supabase

### Performance Verification
- **Before**: 60 individual API calls (~60 seconds)
- **After**: 1 batched call + 60 metadata calls on first run, then instant from cache

---

## Migration Notes

- Existing endpoints remain backward compatible (same response format)
- Frontend HTML files need no changes
- Add `/refresh` endpoints for manual cache invalidation
- Consider adding `updated_at` to API response so frontend can show data freshness




