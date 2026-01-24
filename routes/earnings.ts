import express from 'express';
import earningsController from '../controllers/earningsController';

const router = express.Router();

// GET /api/earnings/:ticker - Get earnings reports for a ticker
router.get('/:ticker', earningsController.getEarnings);

// POST /api/earnings - Add a new earnings report
router.post('/', earningsController.addEarnings);

export default router;
