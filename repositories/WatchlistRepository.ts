import models, { Watchlist } from '../models';

export interface WatchlistData {
    userId: number;
    ticker: string;
}

class WatchlistRepository {
    /**
     * Find watchlist items by user ID
     */
    async findByUserId(userId: number): Promise<Watchlist[]> {
        return await models.Watchlist.findAll({
            where: { userId },
            include: [
                { model: models.Stock }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Find a watchlist item by ID
     */
    async findById(id: number): Promise<Watchlist | null> {
        return await models.Watchlist.findByPk(id, {
            include: [
                { model: models.Stock }
            ]
        });
    }

    /**
     * Find a watchlist item by User and Ticker
     */
    async findByUserAndTicker(userId: number, ticker: string): Promise<Watchlist | null> {
        return await models.Watchlist.findOne({
            where: {
                userId,
                ticker: ticker.toUpperCase()
            }
        });
    }

    /**
     * Create a new watchlist item
     */
    async create(data: WatchlistData): Promise<Watchlist> {
        return await models.Watchlist.create({
            ...data,
            ticker: data.ticker.toUpperCase()
        });
    }

    /**
     * Delete a watchlist item
     */
    async delete(id: number): Promise<boolean> {
        const deleted = await models.Watchlist.destroy({
            where: { id }
        });
        return deleted > 0;
    }

    /**
     * Check if user owns the watchlist item
     */
    async isOwner(id: number, userId: number): Promise<boolean> {
        const count = await models.Watchlist.count({
            where: { id, userId }
        });
        return count > 0;
    }
}

export default new WatchlistRepository();
