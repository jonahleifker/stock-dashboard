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
  change1y?: number;
  marketCap?: number;
  lastUpdated: Date;
  // Extended Metrics
  pe?: number;
  peg?: number;
  eps?: number;
  dividendYield?: number;
  roe?: number;
  netMargin?: number;
  operatingMargin?: number;
  cash?: number;
  totalDebt?: number;
  earningsDate?: Date;
  exDividendDate?: Date;
  targetPrice?: number;
  recommendation?: string;
  description?: string;
  website?: string;
  employees?: number;
  news?: Array<{
    title: string;
    link: string;
    publisher: string;
    providerPublishTime?: number | Date;
    type?: string;
    thumbnail?: {
      resolutions: Array<{ url: string; width: number; height: number }>;
    };
  }>;
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
      if (data1yr.length > 0) {
        const price1yAgo = data1yr[0].close;
        metrics.change1y = price1yAgo ? ((currentPrice - price1yAgo) / price1yAgo) * 100 : undefined;
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
      // Parallel fetch for speed
      const [quote, summary, searchResult] = await Promise.all([
        this.fetchYahooQuote(ticker),
        this.yahooFinance.quoteSummary(ticker, {
          modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile', 'calendarEvents', 'earnings']
        }).catch((e: any) => {
          console.warn(`QuoteSummary failed for ${ticker}:`, e.message);
          return null;
        }),
        this.yahooFinance.search(ticker, { newsCount: 5 }).catch((e: any) => {
          console.warn(`Search/News failed for ${ticker}:`, e.message);
          return null;
        })
      ]);

      if (!quote) return null;

      const currentPrice = quote.regularMarketPrice;
      if (!currentPrice) return null;

      // Calculate metrics from history (keeping existing logic)
      const cachedMetrics = await this.calculateMetrics(ticker, currentPrice);

      // Extract data from quoteSummary
      const stats = summary?.defaultKeyStatistics || {};
      const finData = summary?.financialData || {};
      const sumDetail = summary?.summaryDetail || {};
      const profile = summary?.assetProfile || {};
      const calendar = summary?.calendarEvents || {};

      // Parse News
      const news = searchResult?.news || [];

      const stockData: StockQuote = {
        ticker,
        companyName: quote.longName || quote.shortName || ticker,
        sector: profile.sector || quote.sector || undefined,
        currentPrice,
        marketCap: quote.marketCap || sumDetail.marketCap,

        // History Metrics
        ...cachedMetrics,
        // Override 1y change with official 52 week change if available
        change1y: stats['52WeekChange'] ? (stats['52WeekChange'] * 100) : cachedMetrics.change1y,

        // Extended Metrics
        pe: sumDetail.trailingPE ?? quote.trailingPE,
        peg: stats.pegRatio ?? quote.pegRatio,
        eps: stats.trailingEps ?? quote.epsTrailingTwelveMonths,
        dividendYield: sumDetail.dividendYield ?? quote.dividendYield,
        roe: finData.returnOnEquity,
        netMargin: finData.profitMargins,
        operatingMargin: finData.operatingMargins,
        cash: finData.totalCash,
        totalDebt: finData.totalDebt,
        earningsDate: calendar.earnings?.earningsDate?.[0],
        exDividendDate: sumDetail.exDividendDate,
        targetPrice: finData.targetMeanPrice,
        recommendation: finData.recommendationKey,
        description: profile.longBusinessSummary,
        website: profile.website,
        employees: profile.fullTimeEmployees,

        news: news.map((n: any) => ({
          title: n.title,
          link: n.link,
          publisher: n.publisher,
          providerPublishTime: n.providerPublishTime,
          type: n.type,
          thumbnail: n.thumbnail
        })),

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
   * Get all stocks from database (no limit)
   */
  async getAllStocks(): Promise<StockQuote[]> {
    const stocks = await this.repository.findAll();
    return stocks.map(stock => this.convertToStockQuote(stock));
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
      change1y: stock.change1y,
      marketCap: stock.marketCap,
      lastUpdated: stock.lastUpdated,
      // Pass through new fields if they exist in DB (assuming generic object or updated model)
      pe: stock.pe,
      peg: stock.peg,
      eps: stock.eps,
      dividendYield: stock.dividendYield,
      roe: stock.roe,
      netMargin: stock.netMargin,
      operatingMargin: stock.operatingMargin,
      cash: stock.cash,
      totalDebt: stock.totalDebt,
      earningsDate: stock.earningsDate,
      exDividendDate: stock.exDividendDate,
      targetPrice: stock.targetPrice,
      recommendation: stock.recommendation,
      description: stock.description,
      website: stock.website,
      employees: stock.employees,
      news: stock.news // Assuming DB can store JSON or simplified
    };
  }

  /**
   * Get market pulse data (Major Indices)
   */
  async getMarketPulse(): Promise<any[]> {
    const indices = [
      { ticker: '^DJI', name: 'DJIA' },
      { ticker: '^IXIC', name: 'NASDAQ' },
      { ticker: '^GSPC', name: 'S&P 500' },
      { ticker: 'BTC-USD', name: 'BTC' }
    ];

    const results = [];

    for (const index of indices) {
      try {
        const quote = await this.getStock(index.ticker);

        // For sparkline, we'll fetch 7d history
        const history = await this.fetchHistoricalData(index.ticker, '7d');
        const sparklineData = history.map((h: any) => h.close);

        results.push({
          index: index.name,
          value: quote?.currentPrice?.toLocaleString('en-US', {
            style: index.ticker === 'BTC-USD' ? 'currency' : 'decimal',
            currency: 'USD',
            maximumFractionDigits: 2
          }) || '0.00',
          changePercent: quote?.change7d || 0, // Using 7d change as proxy if 24h not available, or calc from open/close
          sparklineData
        });
      } catch (error) {
        console.error(`Error fetching market pulse for ${index.ticker}:`, error);
        results.push({
          index: index.name,
          value: '0.00',
          changePercent: 0,
          sparklineData: []
        });
      }
    }

    return results;
  }

  /**
   * Get top market news (General "Front Page" news)
   */
  async getMarketNews(): Promise<any[]> {
    try {
      // Search for broad market terms and major indices to get top news
      // Increased count to ensure we have enough after filtering
      // Adding specific high-quality search terms might help too
      const queries = ['stock market', 'federal reserve', '^GSPC', '^DJI', 'economy', 'investing'];

      // Strict list of trusted sources
      const TRUSTED_SOURCES = ['Reuters', 'Bloomberg', 'CNBC', 'Wall Street Journal', 'Financial Times', 'Barrons'];

      const results = await Promise.all(
        queries.map(q =>
          this.yahooFinance.search(q, { newsCount: 10 }) // Fetch more to allow for filtering
            .catch((e: any) => {
              console.warn(`Market news search failed for ${q}:`, e.message);
              return { news: [] };
            })
        )
      );

      // Aggregate all news
      const allNews: any[] = [];
      const seenLinks = new Set<string>();

      results.forEach(res => {
        if (res && res.news) {
          res.news.forEach((n: any) => {
            // Check if source is trusted
            const publisher = n.publisher || '';
            const isTrusted = TRUSTED_SOURCES.some(source => publisher.toLowerCase().includes(source.toLowerCase()));

            if (isTrusted && !seenLinks.has(n.link)) {
              seenLinks.add(n.link);
              allNews.push({
                title: n.title,
                link: n.link,
                publisher: n.publisher,
                providerPublishTime: n.providerPublishTime,
                type: n.type,
                thumbnail: n.thumbnail,
                relatedTickers: n.relatedTickers || []
              });
            }
          });
        }
      });

      // Sort by time (newest first)
      return allNews.sort((a, b) => {
        const timeA = typeof a.providerPublishTime === 'number' ? a.providerPublishTime * 1000 : new Date(a.providerPublishTime).getTime();
        const timeB = typeof b.providerPublishTime === 'number' ? b.providerPublishTime * 1000 : new Date(b.providerPublishTime).getTime();
        return timeB - timeA;
      }).slice(0, 20); // Return top 20
    } catch (error) {
      console.error('Error fetching market news:', error);
      return [];
    }
  }
}

export default new StockService();
