import { Request, Response } from 'express';
import favoriteService from '../services/favoriteService';

class FavoriteController {
    /**
     * GET /api/favorites
     * Get all favorites for the authenticated user
     */
    async getFavorites(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const favorites = await favoriteService.getFavorites(userId);
            res.json({ favorites });
        } catch (error) {
            console.error('Error fetching favorites:', error);
            res.status(500).json({ error: 'Failed to fetch favorites' });
        }
    }

    /**
     * POST /api/favorites
     * Add a new favorite
     */
    async addFavorite(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { ticker, averagePrice, shares } = req.body;
            if (!ticker) {
                return res.status(400).json({ error: 'Ticker is required' });
            }

            const favorite = await favoriteService.addFavorite({
                userId,
                ticker: ticker as string,
                averagePrice: averagePrice ? parseFloat(averagePrice as string) : null,
                shares: shares ? parseFloat(shares as string) : null,
            });

            res.status(201).json({ favorite });
        } catch (error: any) {
            if (error.message === 'Ticker is already in favorites') {
                return res.status(409).json({ error: error.message });
            }
            console.error('Error adding favorite:', error);
            res.status(500).json({ error: 'Failed to add favorite' });
        }
    }

    /**
     * PUT /api/favorites/:id
     * Update a favorite
     */
    async updateFavorite(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string, 10);
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid ID' });
            }

            const { averagePrice, shares } = req.body;
            const favorite = await favoriteService.updateFavorite(id, userId, {
                averagePrice: averagePrice !== undefined ? parseFloat(averagePrice as string) : undefined,
                shares: shares !== undefined ? parseFloat(shares as string) : undefined,
            });

            if (!favorite) {
                return res.status(404).json({ error: 'Favorite not found' });
            }

            res.json({ favorite });
        } catch (error: any) {
            if (error.message?.includes('Unauthorized')) {
                return res.status(403).json({ error: error.message });
            }
            console.error('Error updating favorite:', error);
            res.status(500).json({ error: 'Failed to update favorite' });
        }
    }

    async deleteFavorite(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string, 10);
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid ID' });
            }

            await favoriteService.removeFavorite(id, userId);
            res.json({ message: 'Favorite removed successfully' });
        } catch (error: any) {
            if (error.message?.includes('Unauthorized')) {
                return res.status(403).json({ error: error.message });
            }
            console.error('Error removing favorite:', error);
            res.status(500).json({ error: 'Failed to remove favorite' });
        }
    }

    /**
     * POST /api/favorites/bulk
     * Add multiple favorites
     */
    async addBulkFavorites(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { tickers } = req.body;
            if (!tickers || !Array.isArray(tickers)) {
                return res.status(400).json({ error: 'Tickers array is required' });
            }

            // Clean tickers: string only, trim, non-empty
            const cleanTickers = tickers
                .map((t: any) => String(t || '').trim())
                .filter((t: string) => t.length > 0);

            if (cleanTickers.length === 0) {
                return res.status(400).json({ error: 'No valid tickers provided' });
            }

            const favorites = await favoriteService.addBulkFavorites(userId, cleanTickers);

            res.status(201).json({
                message: `Successfully processed ${favorites.length} favorites`,
                favorites
            });
        } catch (error: any) {
            console.error('Error bulk adding favorites:', error);
            res.status(500).json({ error: 'Failed to bulk add favorites' });
        }
    }
}

export default new FavoriteController();
