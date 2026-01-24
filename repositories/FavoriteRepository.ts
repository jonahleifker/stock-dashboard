import models, { Favorite } from '../models';

export interface FavoriteData {
    userId: number;
    ticker: string;
    averagePrice?: number | null;
    shares?: number | null;
}

class FavoriteRepository {
    /**
     * Find favorites by user ID
     */
    async findByUserId(userId: number): Promise<Favorite[]> {
        return await models.Favorite.findAll({
            where: { userId },
            include: [
                { model: models.Stock }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Find a favorite by ID
     */
    async findById(id: number): Promise<Favorite | null> {
        return await models.Favorite.findByPk(id, {
            include: [
                { model: models.Stock }
            ]
        });
    }

    /**
     * Find a favorite by User and Ticker
     */
    async findByUserAndTicker(userId: number, ticker: string): Promise<Favorite | null> {
        return await models.Favorite.findOne({
            where: {
                userId,
                ticker: ticker.toUpperCase()
            }
        });
    }

    /**
     * Create a new favorite
     */
    async create(data: FavoriteData): Promise<Favorite> {
        return await models.Favorite.create(data);
    }

    /**
     * Update a favorite
     */
    async update(id: number, data: Partial<FavoriteData>): Promise<Favorite | null> {
        const favorite = await this.findById(id);
        if (!favorite) return null;
        return await favorite.update(data);
    }

    /**
     * Delete a favorite
     */
    async delete(id: number): Promise<boolean> {
        const deleted = await models.Favorite.destroy({
            where: { id }
        });
        return deleted > 0;
    }

    /**
     * Check if user owns the favorite item
     */
    async isOwner(id: number, userId: number): Promise<boolean> {
        const count = await models.Favorite.count({
            where: { id, userId }
        });
        return count > 0;
    }
}

export default new FavoriteRepository();
