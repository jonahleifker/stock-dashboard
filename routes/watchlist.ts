import express from 'express';
import watchlistController from '../controllers/watchlistController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Require authentication for all watchlist routes
router.use(authenticate);

router.get('/', watchlistController.getWatchlist);
router.post('/', watchlistController.addToWatchlist);
router.delete('/:id', watchlistController.removeFromWatchlist);

export default router;
