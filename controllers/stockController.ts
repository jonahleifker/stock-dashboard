import { Request, Response } from 'express';
import stockService from '../services/stockService';
import { TICKERS, EXPANDED_TICKERS, RECENT_IPOS } from '../config/tickers';

/**
 * Stock Controller - handles stock data API endpoints
 */

/**
 * GET /api/stocks
 * Returns Fortune 100 stocks with current price, 30-day high, sector
 * Uses cache first, fetches fresh if stale (>1 hour)
 */
export async function getStocks(req: Request, res: Response) {
  try {
    const forceRefresh = req.query.refresh === 'true';
    // Use getAllStocks to return everything in the DB, not just the hardcoded list
    const stocks = await stockService.getAllStocks();

    // Calculate additional metrics for response
    const stocksWithMetrics = stocks.map(stock => {
      const percentFromHigh30d = stock.high30d && stock.currentPrice
        ? ((stock.currentPrice - stock.high30d) / stock.high30d) * 100
        : null;

      return {
        ticker: stock.ticker,
        companyName: stock.companyName,
        sector: stock.sector,
        currentPrice: stock.currentPrice,
        high30d: stock.high30d,
        percentFromHigh30d,
        change7d: stock.change7d,
        change30d: stock.change30d,
        change1y: stock.change1y,
        marketCap: stock.marketCap,
        lastUpdated: stock.lastUpdated,
        news: stock.news,
      };
    });

    res.json({
      success: true,
      count: stocksWithMetrics.length,
      data: stocksWithMetrics,
      cached: !forceRefresh,
    });
  } catch (error) {
    console.error('Error in getStocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/stocks/sectors
 * Returns sector performance analysis
 * Groups 200+ stocks by sector, calculates 7d, 30d, 90d averages
 */
export async function getSectors(req: Request, res: Response) {
  try {
    const sectors = await stockService.analyzeSectors(EXPANDED_TICKERS);

    res.json({
      success: true,
      count: sectors.length,
      data: sectors,
    });
  } catch (error) {
    console.error('Error in getSectors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sectors',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/stocks/deep-pullbacks
 * Returns stocks down 50%+ from highs
 * Analyzes 3mo, 6mo, 1yr timeframes based on query param
 */
export async function getDeepPullbacks(req: Request, res: Response) {
  try {
    const timeframe = (req.query.timeframe as '3mo' | '6mo' | '1yr') || '6mo';

    // Validate timeframe
    if (!['3mo', '6mo', '1yr'].includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe',
        message: 'Timeframe must be one of: 3mo, 6mo, 1yr',
      });
    }

    const pullbacks = await stockService.findDeepPullbacks(timeframe);

    res.json({
      success: true,
      count: pullbacks.length,
      timeframe,
      data: pullbacks,
    });
  } catch (error) {
    console.error('Error in getDeepPullbacks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find deep pullbacks',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/stocks/ipos
 * Returns recent IPO performance
 * Compares current price to IPO price (when available)
 */
export async function getIPOs(req: Request, res: Response) {
  try {
    const ipos = await stockService.analyzeIPOs();

    res.json({
      success: true,
      count: ipos.length,
      data: ipos,
    });
  } catch (error) {
    console.error('Error in getIPOs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze IPOs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/stocks/market-pulse
 * Returns market pulse data (Major Indices)
 */
export async function getMarketPulse(req: Request, res: Response) {
  try {
    const pulse = await stockService.getMarketPulse();

    res.json({
      success: true,
      count: pulse.length,
      data: pulse,
    });
  } catch (error) {
    console.error('Error in getMarketPulse:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market pulse',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/stocks/refresh
 * Force refresh all stock data from Yahoo Finance
 * Bypasses cache
 */
export async function refreshStocks(req: Request, res: Response) {
  try {
    // Start refresh in background
    res.json({
      success: true,
      message: 'Stock refresh initiated',
      note: 'This may take several minutes to complete',
    });

    // Perform refresh asynchronously
    stockService.refreshAllStocks()
      .then(result => {
        console.log('Stock refresh completed:', result);
      })
      .catch(error => {
        console.error('Stock refresh failed:', error);
      });
  } catch (error) {
    console.error('Error in refreshStocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate refresh',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/stocks/:ticker
 * Get details for a specific stock
 */
export async function getStockByTicker(req: Request, res: Response) {
  try {
    const ticker = typeof req.params.ticker === 'string' ? req.params.ticker : req.params.ticker[0];
    const forceRefresh = req.query.refresh === 'true';

    const stock = await stockService.getStock(ticker.toUpperCase(), forceRefresh);

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found',
        message: `No data available for ticker: ${ticker}`,
      });
    }

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error('Error in getStockByTicker:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/stocks/bulk
 * Bulk import tickers
 */
export async function bulkImportStocks(req: Request, res: Response) {
  try {
    const { tickers } = req.body; // Expecting { tickers: "AAPL, MSFT, ..." } or array

    if (!tickers) {
      return res.status(400).json({ success: false, error: 'Tickers are required' });
    }

    let tickerList: string[] = [];
    if (typeof tickers === 'string') {
      tickerList = tickers.split(/[\s,]+/).map((s: string) => s.trim().toUpperCase()).filter(Boolean);
    } else if (Array.isArray(tickers)) {
      tickerList = tickers.map((s: any) => String(s).trim().toUpperCase()).filter(Boolean);
    }

    const uniqueTickers = [...new Set(tickerList)];

    // Trigger fetch
    const results = await stockService.getStocks(uniqueTickers, true); // true = force refresh/create

    // Calculate success/fail
    const foundTickers = new Set(results.map(s => s.ticker));
    const failedTickers = uniqueTickers.filter(t => !foundTickers.has(t));

    res.json({
      success: true,
      count: results.length,
      totalRequested: uniqueTickers.length,
      failedCount: failedTickers.length,
      failedTickers,
      message: `Successfully imported ${results.length} stocks. ${failedTickers.length > 0 ? `Failed: ${failedTickers.join(', ')}` : ''}`,
    });
  } catch (error) {
    console.error('Error in bulkImportStocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk import stocks',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/stocks/news/top
 * Get top market news
 */
export async function getMarketNews(req: Request, res: Response) {
  try {
    const news = await stockService.getMarketNews();

    res.json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    console.error('Error in getMarketNews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market news',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default {
  getStocks,
  getSectors,
  getDeepPullbacks,
  getIPOs,
  refreshStocks,
  getStockByTicker,
  bulkImportStocks,
  getMarketPulse,
  getMarketNews,
};
