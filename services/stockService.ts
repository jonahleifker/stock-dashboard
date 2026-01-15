import yahooFinance from 'yahoo-finance2';
import StockRepository from '../repositories/StockRepository';
import { TICKERS, EXPANDED_TICKERS, RECENT_IPOS } from '../config/tickers';

export interface StockQuote {
  ticker: string;
  companyName?: string;
  sector?: string;
  currentPrice?: number;
  high30d?: number;
  high3mo?: number;
  high6mo?: number;
  high1yr?: number;
  change7d?: number;
  change30d?: number;
  change90d?: number;
  marketCap?: number;
  lastUpdated: Date;
}

export interface SectorPerformance {
  sector: string;
  stockCount: number;
  avgChange7d: number;
  avgChange30d: number;
  avgChange90d: number;
  topStocks: Array<{
    ticker: string;
    companyName: string;
    change30d: number;
  }>;
}

export interface DeepPullback {
  ticker: string;
  companyName: string;
  currentPrice: number;
  high: number;
  percentFromHigh: number;
  marketCap: number;
  timeframe: '3mo' | '6mo' | '1yr';
}

export interface IPOPerformance {
  ticker: string;
  companyName: string;
  ipoDate?: string;
  ipoPrice?: number;
  currentPrice: number;
  percentChange: number;
  marketCap?: number;
}

/**
 * Stock Service - handles Yahoo Finance API integration and caching
 */
export class StockService {
  private readonly CACHE_DURATION_HOURS = 1;
  private readonly repository = StockRepository;
  private yahooFinance: any;

  constructor() {
    const YahooFinance = require('yahoo-finance2').default;
    this.yahooFinance = new YahooFinance();
  }

  /**
   * Fetch stock quotes from Yahoo Finance
   */
  private async fetchYahooQuote(ticker: string): Promise<any> {
    try {
      const quote = await this.yahooFinance.quote(ticker);
      return quote;
    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Fetch historical data for calculating highs and changes
   */
  private async fetchHistoricalData(ticker: string, period: '7d' | '1mo' | '3mo' | '6mo' | '1y'): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();

      // Calculate start date based on period
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '1mo':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3mo':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6mo':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const historical = await this.yahooFinance.historical(ticker, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      });

      return historical || [];
    } catch (error) {
      console.error(`Error fetching historical data for ${ticker}:`, error);
      return [];
    }
  }

  /**
   * Calculate high prices and changes from historical data
   */
  private async calculateMetrics(ticker: string, currentPrice: number): Promise<Partial<StockQuote>> {
    const metrics: Partial<StockQuote> = {};

    try {
      // Fetch historical data for different periods
      const [data7d, data1mo, data3mo, data6mo, data1yr] = await Promise.all([
        this.fetchHistoricalData(ticker, '7d'),
        this.fetchHistoricalData(ticker, '1mo'),
        this.fetchHistoricalData(ticker, '3mo'),
        this.fetchHistoricalData(ticker, '6mo'),
        this.fetchHistoricalData(ticker, '1y'),
      ]);

      // Calculate highs
      if (data1mo.length > 0) {
        metrics.high30d = Math.max(...data1mo.map((d: any) => d.high || 0));
      }
      if (data3mo.length > 0) {
        metrics.high3mo = Math.max(...data3mo.map((d: any) => d.high || 0));
      }
      if (data6mo.length > 0) {
        metrics.high6mo = Math.max(...data6mo.map((d: any) => d.high || 0));
      }
      if (data1yr.length > 0) {
        metrics.high1yr = Math.max(...data1yr.map((d: any) => d.high || 0));
      }

      // Calculate changes
      if (data7d.length > 0) {
        const price7dAgo = data7d[0].close;
        metrics.change7d = price7dAgo ? ((currentPrice - price7dAgo) / price7dAgo) * 100 : undefined;
      }
      if (data1mo.length > 0) {
        const price30dAgo = data1mo[0].close;
        metrics.change30d = price30dAgo ? ((currentPrice - price30dAgo) / price30dAgo) * 100 : undefined;
      }
      if (data3mo.length > 0) {
        const price90dAgo = data3mo[0].close;
        metrics.change90d = price90dAgo ? ((currentPrice - price90dAgo) / price90dAgo) * 100 : undefined;
      }
    } catch (error) {
      console.error(`Error calculating metrics for ${ticker}:`, error);
    }

    return metrics;
  }

  /**
   * Fetch and process stock data from Yahoo Finance
   */
  async fetchStockData(ticker: string): Promise<StockQuote | null> {
    try {
      const quote = await this.fetchYahooQuote(ticker);
      if (!quote) return null;

      const currentPrice = quote.regularMarketPrice;
      if (!currentPrice) return null;

      // Calculate metrics
      const metrics = await this.calculateMetrics(ticker, currentPrice);

      const stockData: StockQuote = {
        ticker,
        companyName: quote.longName || quote.shortName || ticker,
        sector: quote.sector || undefined,
        currentPrice,
        marketCap: quote.marketCap || undefined,
        ...metrics,
        lastUpdated: new Date(),
      };

      return stockData;
    } catch (error) {
      console.error(`Error fetching stock data for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get stock data (from cache or fetch fresh)
   */
  async getStock(ticker: string, forceRefresh = false): Promise<StockQuote | null> {
    // Check cache first
    if (!forceRefresh) {
      const cached = await this.repository.findByTicker(ticker);
      if (cached && cached.lastUpdated) {
        const isStale = await this.repository.isStale(ticker, this.CACHE_DURATION_HOURS);
        if (!isStale) {
          return this.convertToStockQuote(cached);
        }
      }
    }

    // Fetch fresh data
    const freshData = await this.fetchStockData(ticker);
    if (freshData) {
      await this.repository.upsert(freshData);
    }

    return freshData;
  }

  /**
   * Get multiple stocks (with caching)
   */
  async getStocks(tickers: string[] = TICKERS, forceRefresh = false): Promise<StockQuote[]> {
    const results: StockQuote[] = [];

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      const batchPromises = batch.map(ticker => this.getStock(ticker, forceRefresh));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults.filter((stock): stock is StockQuote => stock !== null));

      // Small delay between batches to respect rate limits
      if (i + batchSize < tickers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Analyze sector performance
   */
  async analyzeSectors(tickers: string[] = EXPANDED_TICKERS): Promise<SectorPerformance[]> {
    const stocks = await this.getStocks(tickers);

    // Group by sector
    const sectorMap = new Map<string, StockQuote[]>();
    stocks.forEach(stock => {
      const sector = stock.sector || 'Unknown';
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
      }
      sectorMap.get(sector)!.push(stock);
    });

    // Calculate sector averages
    const sectorPerformance: SectorPerformance[] = [];

    sectorMap.forEach((stocks, sector) => {
      const validStocks7d = stocks.filter(s => s.change7d !== undefined && s.change7d !== null);
      const validStocks30d = stocks.filter(s => s.change30d !== undefined && s.change30d !== null);
      const validStocks90d = stocks.filter(s => s.change90d !== undefined && s.change90d !== null);

      const avgChange7d = validStocks7d.length > 0
        ? validStocks7d.reduce((sum, s) => sum + s.change7d!, 0) / validStocks7d.length
        : 0;

      const avgChange30d = validStocks30d.length > 0
        ? validStocks30d.reduce((sum, s) => sum + s.change30d!, 0) / validStocks30d.length
        : 0;

      const avgChange90d = validStocks90d.length > 0
        ? validStocks90d.reduce((sum, s) => sum + s.change90d!, 0) / validStocks90d.length
        : 0;

      // Get top 5 stocks by 30d change
      const topStocks = [...stocks]
        .filter(s => s.change30d !== undefined && s.change30d !== null)
        .sort((a, b) => (b.change30d || 0) - (a.change30d || 0))
        .slice(0, 5)
        .map(s => ({
          ticker: s.ticker,
          companyName: s.companyName || s.ticker,
          change30d: s.change30d || 0,
        }));

      sectorPerformance.push({
        sector,
        stockCount: stocks.length,
        avgChange7d,
        avgChange30d,
        avgChange90d,
        topStocks,
      });
    });

    // Sort by 30d performance
    return sectorPerformance.sort((a, b) => b.avgChange30d - a.avgChange30d);
  }

  /**
   * Find stocks with deep pullbacks (50%+ from highs)
   */
  async findDeepPullbacks(timeframe: '3mo' | '6mo' | '1yr' = '6mo'): Promise<DeepPullback[]> {
    const stocks = await this.getStocks(EXPANDED_TICKERS);
    const pullbacks: DeepPullback[] = [];

    stocks.forEach(stock => {
      let high: number | undefined;

      switch (timeframe) {
        case '3mo':
          high = stock.high3mo;
          break;
        case '6mo':
          high = stock.high6mo;
          break;
        case '1yr':
          high = stock.high1yr;
          break;
      }

      if (high && stock.currentPrice) {
        const percentFromHigh = ((stock.currentPrice - high) / high) * 100;

        if (percentFromHigh <= -50) {
          pullbacks.push({
            ticker: stock.ticker,
            companyName: stock.companyName || stock.ticker,
            currentPrice: stock.currentPrice,
            high,
            percentFromHigh,
            marketCap: stock.marketCap || 0,
            timeframe,
          });
        }
      }
    });

    // Sort by percent from high (most negative first)
    return pullbacks.sort((a, b) => a.percentFromHigh - b.percentFromHigh);
  }

  /**
   * Analyze IPO performance
   */
  async analyzeIPOs(): Promise<IPOPerformance[]> {
    const stocks = await this.getStocks(RECENT_IPOS);

    // Note: Yahoo Finance doesn't always have IPO price data
    // This is a simplified version - you may need to maintain a separate IPO price database
    const ipoPerformance: IPOPerformance[] = stocks.map(stock => ({
      ticker: stock.ticker,
      companyName: stock.companyName || stock.ticker,
      currentPrice: stock.currentPrice || 0,
      percentChange: stock.change90d || 0, // Using 90d change as approximation
      marketCap: stock.marketCap,
    }));

    // Sort by performance
    return ipoPerformance.sort((a, b) => b.percentChange - a.percentChange);
  }

  /**
   * Refresh all stock data
   */
  async refreshAllStocks(): Promise<{ success: number; failed: number }> {
    const tickers = [...new Set([...TICKERS, ...EXPANDED_TICKERS, ...RECENT_IPOS])];
    let success = 0;
    let failed = 0;

    console.log(`Refreshing ${tickers.length} stocks...`);

    for (const ticker of tickers) {
      const result = await this.getStock(ticker, true);
      if (result) {
        success++;
      } else {
        failed++;
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Refresh complete: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Convert database model to StockQuote interface
   */
  private convertToStockQuote(stock: any): StockQuote {
    return {
      ticker: stock.ticker,
      companyName: stock.companyName,
      sector: stock.sector,
      currentPrice: stock.currentPrice,
      high30d: stock.high30d,
      high3mo: stock.high3mo,
      high6mo: stock.high6mo,
      high1yr: stock.high1yr,
      change7d: stock.change7d,
      change30d: stock.change30d,
      change90d: stock.change90d,
      marketCap: stock.marketCap,
      lastUpdated: stock.lastUpdated,
    };
  }
}

export default new StockService();
