import { Article, User } from '../models';

export interface ArticleData {
  ticker: string;
  userId: number;
  title: string;
  url: string;
  sourceName?: string;
  publishedAt?: Date;
}

/**
 * Article Repository - handles all article link operations
 */
export class ArticleRepository {
  /**
   * Find article by ID
   */
  async findById(id: number): Promise<Article | null> {
    return await Article.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
    });
  }

  /**
   * Find all articles for a stock ticker
   */
  async findByTicker(ticker: string): Promise<Article[]> {
    return await Article.findAll({
      where: { ticker },
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['publishedAt', 'DESC'], ['addedAt', 'DESC']],
    });
  }

  /**
   * Find all articles by a user
   */
  async findByUserId(userId: number): Promise<Article[]> {
    return await Article.findAll({
      where: { userId },
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['addedAt', 'DESC']],
    });
  }

  /**
   * Create a new article
   */
  async create(data: ArticleData): Promise<Article> {
    const article = await Article.create(data);
    return await this.findById(article.id) as Article;
  }

  /**
   * Update existing article
   */
  async update(id: number, data: Partial<ArticleData>): Promise<Article | null> {
    const article = await Article.findByPk(id);
    if (!article) {
      return null;
    }
    await article.update(data);
    return await this.findById(id);
  }

  /**
   * Delete article
   */
  async delete(id: number): Promise<boolean> {
    const deleted = await Article.destroy({
      where: { id },
    });
    return deleted > 0;
  }

  /**
   * Check if user owns article
   */
  async isOwner(articleId: number, userId: number): Promise<boolean> {
    const article = await Article.findByPk(articleId);
    return article?.userId === userId;
  }

  /**
   * Get all articles (for admin/overview)
   */
  async findAll(): Promise<Article[]> {
    return await Article.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['addedAt', 'DESC']],
    });
  }

  /**
   * Count articles for a ticker
   */
  async countByTicker(ticker: string): Promise<number> {
    return await Article.count({
      where: { ticker },
    });
  }

  /**
   * Count articles by a user
   */
  async countByUserId(userId: number): Promise<number> {
    return await Article.count({
      where: { userId },
    });
  }
}

export default new ArticleRepository();
