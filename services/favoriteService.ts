import FavoriteRepository, { FavoriteData } from '../repositories/FavoriteRepository';
import { Favorite } from '../models';
import stockService from './stockService';

class FavoriteService {
    private repository = FavoriteRepository;

    /**
     * Get all favorites for a user
     */
    async getFavorites(userId: number): Promise<Favorite[]> {
        return await this.repository.findByUserId(userId);
    }

    /**
     * Create a new favorite
     */
    async addFavorite(data: FavoriteData): Promise<Favorite> {
        // Check if already exists
        const existing = await this.repository.findByUserAndTicker(data.userId, data.ticker);
        if (existing) {
            throw new Error('Ticker is already in favorites');
        }

        // Ensure the stock exists in the database by fetching it from Yahoo Finance
        // This creates/updates the stock record before we create the association
        const ticker = data.ticker.toUpperCase();
        await stockService.getStock(ticker, true);

        return await this.repository.create({
            ...data,
            ticker
        });
    }

    /**
     * Update a favorite
     */
    async updateFavorite(id: number, userId: number, data: Partial<FavoriteData>): Promise<Favorite | null> {
        const isOwner = await this.repository.isOwner(id, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: User does not own this favorite');
        }
        return await this.repository.update(id, data);
    }

    /**
     * Remove a favorite
     */
    async removeFavorite(id: number, userId: number): Promise<boolean> {
        const isOwner = await this.repository.isOwner(id, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: User does not own this favorite');
        }
        return await this.repository.delete(id);
    }

    /**
     * Add multiple favorites at once
     */
    async addBulkFavorites(userId: number, tickers: string[]): Promise<Favorite[]> {
        const results: Favorite[] = [];

        for (const ticker of tickers) {
            try {
                // Check if already exists
                const existing = await this.repository.findByUserAndTicker(userId, ticker);

                if (!existing) {
                    // Ensure the stock exists in the database
                    const upperTicker = ticker.toUpperCase();
                    await stockService.getStock(upperTicker, true);

                    const favorite = await this.repository.create({
                        userId,
                        ticker: upperTicker,
                        averagePrice: null,
                        shares: null
                    });
                    results.push(favorite);
                }
            } catch (error) {
                // Determine if we should fail or just skip
                console.warn(`Failed to add favorite ${ticker} in bulk op:`, error);
            }
        }

        return results;
    }
}

export default new FavoriteService();
