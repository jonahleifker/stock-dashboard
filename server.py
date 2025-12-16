import yfinance as yf
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Fortune 100 public company tickers
TICKERS = [
    'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'BRK-B', 'UNH', 'JNJ', 'XOM', 'JPM', 'V',
    'PG', 'CVX', 'MA', 'HD', 'BAC', 'ABBV', 'PFE', 'KO', 'COST', 'WMT',
    'DIS', 'CSCO', 'INTC', 'VZ', 'CMCSA', 'ADBE', 'NFLX', 'NKE', 'CRM', 'T',
    'MRK', 'TMO', 'ABT', 'DHR', 'ACN', 'ORCL', 'TXN', 'PM', 'NEE', 'LLY',
    'UPS', 'RTX', 'LOW', 'UNP', 'QCOM', 'HON', 'AMD', 'CAT', 'BA', 'GE',
    'IBM', 'SBUX', 'GS', 'AXP', 'BLK', 'MDT', 'MMM', 'GILD', 'C', 'MS',
]

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    results = []
    
    for ticker in TICKERS:
        try:
            print(f"Fetching {ticker}...")
            stock = yf.Ticker(ticker)
            
            # Get 30 days of historical data
            hist = stock.history(period='1mo')
            
            if hist.empty:
                print(f"No data for {ticker}")
                continue
            
            # Get current price (most recent close)
            current_price = float(hist['Close'].iloc[-1])
            
            # Get 30-day high
            high_30d = float(hist['High'].max())
            
            # Get company info
            info = stock.info
            company_name = info.get('longName', info.get('shortName', ticker))
            sector = info.get('sector', 'Unknown')
            
            results.append({
                'ticker': ticker,
                'company': company_name,
                'currentPrice': current_price,
                'highLast30Days': high_30d,
                'sector': sector
            })
            
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            continue
    
    return jsonify(results)

# Expanded stock list covering major sectors
EXPANDED_TICKERS = [
    # Technology
    'AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'TSLA', 'AVGO', 'ORCL', 'ADBE', 'CRM',
    'CSCO', 'INTC', 'AMD', 'QCOM', 'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC', 'SNPS',
    
    # Healthcare
    'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY',
    'AMGN', 'GILD', 'CVS', 'CI', 'HUM', 'ISRG', 'VRTX', 'REGN', 'ZTS', 'ELV',
    
    # Financial Services
    'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SPGI', 'BLK', 'C',
    'SCHW', 'AXP', 'CB', 'PGR', 'MMC', 'ICE', 'CME', 'AON', 'USB', 'PNC',
    
    # Consumer Cyclical
    'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TJX', 'BKNG', 'CMG',
    'MAR', 'ABNB', 'GM', 'F', 'ROST', 'YUM', 'DRI', 'ULTA', 'DHI', 'LEN',
    
    # Consumer Defensive
    'WMT', 'PG', 'KO', 'PEP', 'COST', 'PM', 'MO', 'CL', 'MDLZ', 'KMB',
    'GIS', 'K', 'HSY', 'SYY', 'KHC', 'TSN', 'CAG', 'CPB', 'MKC', 'CHD',
    
    # Energy
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
    'WMB', 'KMI', 'BKR', 'HES', 'FANG', 'DVN', 'EQT', 'MRO', 'APA', 'CTRA',
    
    # Industrials
    'CAT', 'BA', 'HON', 'UNP', 'RTX', 'UPS', 'GE', 'LMT', 'DE', 'MMM',
    'EMR', 'ETN', 'GD', 'NOC', 'CSX', 'NSC', 'FDX', 'WM', 'PCAR', 'ITW',
    
    # Communication Services
    'META', 'GOOGL', 'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'TMUS', 'CHTR', 'EA',
    'TTWO', 'WBD', 'PARA', 'OMC', 'MTCH', 'FOXA', 'IPG', 'NWSA', 'LYV', 'MSG',
    
    # Real Estate
    'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'DLR', 'O', 'WELL', 'SPG', 'VICI',
    'AVB', 'EQR', 'SBAC', 'WY', 'INVH', 'ARE', 'MAA', 'ESS', 'VTR', 'EXR',
    
    # Utilities
    'NEE', 'SO', 'DUK', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ES', 'ED',
    'PEG', 'WEC', 'EIX', 'AWK', 'FE', 'ETR', 'PPL', 'AEE', 'CMS', 'DTE',
    
    # Basic Materials
    'LIN', 'APD', 'SHW', 'ECL', 'DD', 'NEM', 'FCX', 'NUE', 'VMC', 'MLM',
    'PPG', 'CTVA', 'EMN', 'ALB', 'IFF', 'CE', 'FMC', 'CF', 'MOS', 'DOW',
]

@app.route('/api/sectors', methods=['GET'])
def get_sectors():
    sector_data = {}
    
    for ticker in EXPANDED_TICKERS:
        try:
            print(f"Fetching sector data for {ticker}...")
            stock = yf.Ticker(ticker)
            
            # Get historical data for different timeframes
            hist_90d = stock.history(period='3mo')
            
            if hist_90d.empty:
                continue
            
            # Get sector info
            info = stock.info
            sector = info.get('sector', 'Unknown')
            company_name = info.get('longName', info.get('shortName', ticker))
            
            if sector == 'Unknown' or sector is None:
                continue
            
            # Calculate performance for different timeframes
            current_price = float(hist_90d['Close'].iloc[-1])
            
            # 7-day performance
            if len(hist_90d) >= 7:
                price_7d_ago = float(hist_90d['Close'].iloc[-7])
                change_7d = ((current_price - price_7d_ago) / price_7d_ago) * 100
            else:
                change_7d = None
            
            # 30-day performance
            if len(hist_90d) >= 30:
                price_30d_ago = float(hist_90d['Close'].iloc[-30])
                change_30d = ((current_price - price_30d_ago) / price_30d_ago) * 100
            else:
                change_30d = None
            
            # 90-day performance
            if len(hist_90d) >= 90:
                price_90d_ago = float(hist_90d['Close'].iloc[0])
                change_90d = ((current_price - price_90d_ago) / price_90d_ago) * 100
            else:
                change_90d = None
            
            # Initialize sector if not exists
            if sector not in sector_data:
                sector_data[sector] = {
                    'sector': sector,
                    'stocks': [],
                    'changes_7d': [],
                    'changes_30d': [],
                    'changes_90d': []
                }
            
            # Add stock data
            stock_info = {
                'ticker': ticker,
                'company': company_name,
                'currentPrice': current_price,
                'change_7d': change_7d,
                'change_30d': change_30d,
                'change_90d': change_90d
            }
            
            sector_data[sector]['stocks'].append(stock_info)
            
            if change_7d is not None:
                sector_data[sector]['changes_7d'].append(change_7d)
            if change_30d is not None:
                sector_data[sector]['changes_30d'].append(change_30d)
            if change_90d is not None:
                sector_data[sector]['changes_90d'].append(change_90d)
                
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            continue
    
    # Calculate sector averages and sort stocks
    result = []
    for sector, data in sector_data.items():
        avg_7d = sum(data['changes_7d']) / len(data['changes_7d']) if data['changes_7d'] else 0
        avg_30d = sum(data['changes_30d']) / len(data['changes_30d']) if data['changes_30d'] else 0
        avg_90d = sum(data['changes_90d']) / len(data['changes_90d']) if data['changes_90d'] else 0
        
        # Sort stocks by 30d performance
        sorted_stocks = sorted(data['stocks'], key=lambda x: x['change_30d'] if x['change_30d'] else -999, reverse=True)
        
        result.append({
            'sector': sector,
            'avg_change_7d': round(avg_7d, 2),
            'avg_change_30d': round(avg_30d, 2),
            'avg_change_90d': round(avg_90d, 2),
            'stock_count': len(data['stocks']),
            'top_stocks': sorted_stocks[:5],  # Top 5 performers
            'all_stocks': sorted_stocks
        })
    
    # Sort sectors by performance (30d default)
    result.sort(key=lambda x: x['avg_change_30d'], reverse=True)
    
    return jsonify(result)

@app.route('/api/deep-pullbacks', methods=['GET'])
def get_deep_pullbacks():
    results = []
    
    # Expanded ticker list for more coverage
    all_tickers = list(set(TICKERS + EXPANDED_TICKERS))
    
    for ticker in all_tickers:
        try:
            print(f"Fetching deep pullback data for {ticker}...")
            stock = yf.Ticker(ticker)
            
            # Get 1 year of historical data
            hist = stock.history(period='1y')
            
            if hist.empty or len(hist) < 60:
                continue
            
            # Get current price
            current_price = float(hist['Close'].iloc[-1])
            
            # Calculate high prices for different timeframes
            # 3 month high (last 90 days)
            hist_3mo = hist.iloc[-90:] if len(hist) >= 90 else hist
            high_3mo = float(hist_3mo['High'].max())
            change_3mo = ((current_price - high_3mo) / high_3mo) * 100 if high_3mo > 0 else 0
            
            # 6 month high (last 180 days)
            hist_6mo = hist.iloc[-180:] if len(hist) >= 180 else hist
            high_6mo = float(hist_6mo['High'].max())
            change_6mo = ((current_price - high_6mo) / high_6mo) * 100 if high_6mo > 0 else 0
            
            # 1 year high (all data)
            high_1yr = float(hist['High'].max())
            change_1yr = ((current_price - high_1yr) / high_1yr) * 100 if high_1yr > 0 else 0
            
            # Only include if down at least 50% in any timeframe
            if change_3mo > -50 and change_6mo > -50 and change_1yr > -50:
                continue
            
            # Get company info
            info = stock.info
            company_name = info.get('longName', info.get('shortName', ticker))
            sector = info.get('sector', 'Unknown')
            market_cap = info.get('marketCap', 0)
            
            results.append({
                'ticker': ticker,
                'company': company_name,
                'sector': sector,
                'currentPrice': current_price,
                'marketCap': market_cap,
                'high_3mo': high_3mo,
                'high_6mo': high_6mo,
                'high_1yr': high_1yr,
                'change_3mo': round(change_3mo, 2),
                'change_6mo': round(change_6mo, 2),
                'change_1yr': round(change_1yr, 2),
            })
            
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            continue
    
    # Sort by worst 1-year performance by default
    results.sort(key=lambda x: x['change_1yr'])
    
    return jsonify(results)

# Comprehensive list of recent IPOs (last 5 years)
# Format: (ticker, IPO_date, IPO_price)
RECENT_IPOS = [
    # 2024 IPOs
    ('RDDT', '2024-03-21', 34.00),  # Reddit
    ('ALAB', '2024-03-20', 36.00),  # Astera Labs
    ('IBTA', '2024-04-18', 88.00),  # Ibotta
    ('RBRK', '2024-04-25', 32.00),  # Rubrik
    
    # 2023 IPOs
    ('ARM', '2023-09-14', 51.00),  # ARM Holdings
    ('KVUE', '2023-05-04', 22.00),  # Kenvue
    ('CART', '2023-09-19', 30.00),  # Instacart
    
    # 2022 IPOs
    ('TPG', '2022-01-13', 29.50),  # TPG Inc
    
    # 2021 IPOs (record year!)
    ('RIVN', '2021-11-10', 78.00),  # Rivian
    ('LCID', '2021-07-26', 16.00),  # Lucid Motors
    ('COIN', '2021-04-14', 250.00),  # Coinbase
    ('RBLX', '2021-03-10', 45.00),  # Roblox (direct listing)
    ('BMBL', '2021-02-11', 43.00),  # Bumble
    ('HOOD', '2021-07-29', 38.00),  # Robinhood
    ('AFRM', '2021-01-13', 49.00),  # Affirm
    ('CRWD', '2019-06-12', 34.00),  # CrowdStrike
    
    # 2020 IPOs
    ('SNOW', '2020-09-16', 120.00),  # Snowflake
    ('PLTR', '2020-09-30', 10.00),  # Palantir (direct listing)
    ('U', '2020-09-18', 52.00),  # Unity Software
    ('ABNB', '2020-12-10', 68.00),  # Airbnb
    ('DASH', '2020-12-09', 102.00),  # DoorDash
    ('AI', '2020-12-09', 42.00),  # C3.ai
    
    # 2019 IPOs
    ('UBER', '2019-05-10', 45.00),  # Uber
    ('LYFT', '2019-03-29', 72.00),  # Lyft
    ('PINS', '2019-04-18', 19.00),  # Pinterest
    ('ZM', '2019-04-18', 36.00),  # Zoom
    ('CHWY', '2019-06-14', 22.00),  # Chewy
    ('BYND', '2019-05-02', 25.00),  # Beyond Meat
]

@app.route('/api/ipos', methods=['GET'])
def get_ipos():
    results = []
    
    for ticker, ipo_date, ipo_price in RECENT_IPOS:
        try:
            print(f"Fetching IPO data for {ticker}...")
            stock = yf.Ticker(ticker)
            
            # Get current price
            hist = stock.history(period='5d')
            
            if hist.empty:
                print(f"No data for {ticker}")
                continue
            
            current_price = float(hist['Close'].iloc[-1])
            
            # Calculate change since IPO
            change_since_ipo = ((current_price - ipo_price) / ipo_price) * 100
            
            # Get company info
            info = stock.info
            company_name = info.get('longName', info.get('shortName', ticker))
            sector = info.get('sector', 'Unknown')
            market_cap = info.get('marketCap', 0)
            
            # Calculate days since IPO
            from datetime import datetime
            ipo_datetime = datetime.strptime(ipo_date, '%Y-%m-%d')
            days_since_ipo = (datetime.now() - ipo_datetime).days
            years_since_ipo = days_since_ipo / 365.25
            
            results.append({
                'ticker': ticker,
                'company': company_name,
                'sector': sector,
                'ipoDate': ipo_date,
                'ipoPrice': ipo_price,
                'currentPrice': current_price,
                'changeSinceIPO': round(change_since_ipo, 2),
                'daysSinceIPO': days_since_ipo,
                'yearsSinceIPO': round(years_since_ipo, 1),
                'marketCap': market_cap
            })
            
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            continue
    
    # Sort by performance (best to worst)
    results.sort(key=lambda x: x['changeSinceIPO'], reverse=True)
    
    return jsonify(results)

if __name__ == '__main__':
    print("Starting stock data server on http://localhost:8000")
    print("Press Ctrl+C to stop")
    app.run(port=8000, debug=True)