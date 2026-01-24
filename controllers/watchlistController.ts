import { Request, Response } from 'express';
import watchlistService from '../services/watchlistService';

class WatchlistController {
    /**
     * GET /api/watchlist
     * Get all watchlist items for the authenticated user
     */
    async getWatchlist(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const watchlist = await watchlistService.getWatchlist(userId);
            res.json({ watchlist });
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            res.status(500).json({ error: 'Failed to fetch watchlist' });
        }
    }

    /**
     * POST /api/watchlist
     * Add a ticker to the watchlist
     */
    async addToWatchlist(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { ticker } = req.body;
            if (!ticker) {
                return res.status(400).json({ error: 'Ticker is required' });
            }

            const item = await watchlistService.addToWatchlist({
                userId,
                ticker: ticker as string,
            });

            res.status(201).json({ item });
        } catch (error: any) {
            if (error.message === 'Ticker is already in watchlist') {
                return res.status(409).json({ error: error.message });
            }
            console.error('Error adding to watchlist:', error);
            res.status(500).json({ error: 'Failed to add to watchlist' });
        }
    }

    /**
     * DELETE /api/watchlist/:id
     * Remove a ticker from the watchlist
     */
    async removeFromWatchlist(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string, 10);
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid ID' });
            }

            await watchlistService.removeFromWatchlist(id, userId);
            res.json({ message: 'Removed from watchlist successfully' });
        } catch (error: any) {
            if (error.message?.includes('Unauthorized')) {
                return res.status(403).json({ error: error.message });
            }
            console.error('Error removing from watchlist:', error);
            res.status(500).json({ error: 'Failed to remove from watchlist' });
        }
    }
}

export default new WatchlistController();
