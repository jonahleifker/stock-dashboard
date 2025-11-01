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

if __name__ == '__main__':
    print("Starting stock data server on http://localhost:8000")
    print("Press Ctrl+C to stop")
    app.run(port=8000, debug=True)