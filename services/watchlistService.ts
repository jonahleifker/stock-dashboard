import WatchlistRepository, { WatchlistData } from '../repositories/WatchlistRepository';
import { Watchlist } from '../models';
import stockService from './stockService';

class WatchlistService {
    private repository = WatchlistRepository;

    /**
     * Get all watchlist items for a user
     */
    async getWatchlist(userId: number): Promise<Watchlist[]> {
        return await this.repository.findByUserId(userId);
    }

    /**
     * Add a ticker to the watchlist
     */
    async addToWatchlist(data: WatchlistData): Promise<Watchlist> {
        // Check if already exists
        const existing = await this.repository.findByUserAndTicker(data.userId, data.ticker);
        if (existing) {
            throw new Error('Ticker is already in watchlist');
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
     * Remove a ticker from the watchlist
     */
    async removeFromWatchlist(id: number, userId: number): Promise<boolean> {
        const isOwner = await this.repository.isOwner(id, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: User does not own this watchlist item');
        }
        return await this.repository.delete(id);
    }
}

export default new WatchlistService();
