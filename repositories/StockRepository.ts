import { Stock } from '../models';

export interface StockData {
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
  lastUpdated?: Date;
  // Fundamentals
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
  news?: any[]; // Stored as JSON
}

/**
 * Stock Repository - handles all stock data operations
 */
export class StockRepository {
  /**
   * Find stock by ticker
   */
  async findByTicker(ticker: string): Promise<Stock | null> {
    return await Stock.findByPk(ticker);
  }

  /**
   * Find all stocks
   */
  async findAll(): Promise<Stock[]> {
    return await Stock.findAll({
      order: [['ticker', 'ASC']],
    });
  }

  /**
   * Find stocks by sector
   */
  async findBySector(sector: string): Promise<Stock[]> {
    return await Stock.findAll({
      where: { sector },
      order: [['ticker', 'ASC']],
    });
  }

  /**
   * Create a new stock
   */
  async create(data: StockData): Promise<Stock> {
    return await Stock.create(data);
  }

  /**
   * Update existing stock
   */
  async update(ticker: string, data: Partial<StockData>): Promise<Stock | null> {
    const stock = await Stock.findByPk(ticker);
    if (!stock) {
      return null;
    }
    await stock.update(data);
    return stock;
  }

  /**
   * Upsert stock (create if not exists, update if exists)
   * This is the primary method for updating stock data from Yahoo Finance
   */
  async upsert(data: StockData): Promise<Stock> {
    const [stock, created] = await Stock.upsert(data, {
      returning: true,
    });
    return stock;
  }

  /**
   * Bulk upsert multiple stocks
   */
  async bulkUpsert(stocks: StockData[]): Promise<void> {
    for (const stock of stocks) {
      await Stock.upsert(stock);
    }
  }

  /**
   * Delete stock
   */
  async delete(ticker: string): Promise<boolean> {
    const deleted = await Stock.destroy({
      where: { ticker },
    });
    return deleted > 0;
  }

  /**
   * Check if stock data is stale (older than given hours)
   */
  async isStale(ticker: string, hoursOld: number = 1): Promise<boolean> {
    const stock = await Stock.findByPk(ticker);
    if (!stock || !stock.lastUpdated) {
      return true;
    }

    const now = new Date();
    const lastUpdate = new Date(stock.lastUpdated);
    const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    // If fundamentals are missing (e.g. after migration), consider it stale
    if (
      stock.pe === null || stock.pe === undefined ||
      stock.peg === null || stock.peg === undefined ||
      stock.eps === null || stock.eps === undefined ||
      stock.dividendYield === null || stock.dividendYield === undefined ||
      stock.roe === null || stock.roe === undefined ||
      stock.netMargin === null || stock.netMargin === undefined ||
      stock.operatingMargin === null || stock.operatingMargin === undefined ||
      stock.cash === null || stock.cash === undefined ||
      stock.totalDebt === null || stock.totalDebt === undefined ||
      stock.earningsDate === null || stock.earningsDate === undefined ||
      stock.exDividendDate === null || stock.exDividendDate === undefined ||
      stock.targetPrice === null || stock.targetPrice === undefined
    ) {
      return true;
    }

    return hoursDiff > hoursOld;
  }

  /**
   * Get stocks that need refresh (stale data)
   */
  async getStaleStocks(hoursOld: number = 1): Promise<Stock[]> {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

    return await Stock.findAll({
      where: {
        lastUpdated: {
          [require('sequelize').Op.lt]: cutoffTime,
        },
      },
    });
  }

  /**
   * Get count of all stocks
   */
  async count(): Promise<number> {
    return await Stock.count();
  }
}

export default new StockRepository();
