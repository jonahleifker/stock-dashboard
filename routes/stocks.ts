import express from 'express';
import stockController from '../controllers/stockController';

const router = express.Router();

/**
 * Stock Routes
 * 
 * All routes are prefixed with /api/stocks
 */

// GET /api/stocks - Get all Fortune 100 stocks
router.get('/', stockController.getStocks);

// GET /api/stocks/sectors - Get sector performance analysis
router.get('/sectors', stockController.getSectors);

// GET /api/stocks/market-pulse - Get market pulse (indices)
router.get('/market-pulse', stockController.getMarketPulse);

// GET /api/stocks/news/top - Get top market news
router.get('/news/top', stockController.getMarketNews);

// GET /api/stocks/deep-pullbacks - Get stocks with deep pullbacks (50%+)
router.get('/deep-pullbacks', stockController.getDeepPullbacks);

// GET /api/stocks/ipos - Get IPO performance analysis
router.get('/ipos', stockController.getIPOs);

// POST /api/stocks/refresh - Force refresh all stock data
router.post('/refresh', stockController.refreshStocks);

// GET /api/stocks/:ticker - Get specific stock by ticker
router.get('/:ticker', stockController.getStockByTicker);

// POST /api/stocks/bulk - Bulk import tickers
router.post('/bulk', stockController.bulkImportStocks);

export default router;
