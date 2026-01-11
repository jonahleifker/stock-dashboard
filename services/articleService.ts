import ArticleRepository from '../repositories/ArticleRepository';
import { Article } from '../models';

export interface CreateArticleData {
  ticker: string;
  userId: number;
  title: string;
  url: string;
  sourceName?: string;
  publishedAt?: Date;
}

export interface UpdateArticleData {
  title?: string;
  url?: string;
  sourceName?: string;
  publishedAt?: Date;
}

/**
 * Article Service - Handles article/link operations
 */
export class ArticleService {
  /**
   * Create a new article
   */
  async createArticle(data: CreateArticleData): Promise<Article> {
    // Validate URL format
    try {
      new URL(data.url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Article title is required');
    }

    if (!data.ticker || data.ticker.trim().length === 0) {
      throw new Error('Ticker symbol is required');
    }

    return await ArticleRepository.create({
      ticker: data.ticker.toUpperCase(),
      userId: data.userId,
      title: data.title.trim(),
      url: data.url.trim(),
      sourceName: data.sourceName?.trim(),
      publishedAt: data.publishedAt,
    });
  }

  /**
   * Get all articles for a ticker
   */
  async getArticlesByTicker(ticker: string): Promise<Article[]> {
    return await ArticleRepository.findByTicker(ticker.toUpperCase());
  }

  /**
   * Get all articles by a user
   */
  async getArticlesByUser(userId: number): Promise<Article[]> {
    return await ArticleRepository.findByUserId(userId);
  }

  /**
   * Get article by ID
   */
  async getArticleById(articleId: number): Promise<Article | null> {
    return await ArticleRepository.findById(articleId);
  }

  /**
   * Update an article
   */
  async updateArticle(
    articleId: number,
    userId: number,
    data: UpdateArticleData
  ): Promise<Article> {
    // Check if article exists
    const article = await ArticleRepository.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Check ownership
    if (article.userId !== userId) {
      throw new Error('You do not have permission to edit this article');
    }

    // Validate URL if provided
    if (data.url) {
      try {
        new URL(data.url);
      } catch (error) {
        throw new Error('Invalid URL format');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new Error('Article title cannot be empty');
      }
      updateData.title = data.title.trim();
    }
    if (data.url !== undefined) {
      updateData.url = data.url.trim();
    }
    if (data.sourceName !== undefined) {
      updateData.sourceName = data.sourceName?.trim() || null;
    }
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt;
    }

    const updated = await ArticleRepository.update(articleId, updateData);
    if (!updated) {
      throw new Error('Failed to update article');
    }

    return updated;
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleId: number, userId: number): Promise<boolean> {
    // Check if article exists
    const article = await ArticleRepository.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Check ownership
    if (article.userId !== userId) {
      throw new Error('You do not have permission to delete this article');
    }

    return await ArticleRepository.delete(articleId);
  }

  /**
   * Check if user owns article
   */
  async isArticleOwner(articleId: number, userId: number): Promise<boolean> {
    return await ArticleRepository.isOwner(articleId, userId);
  }

  /**
   * Get article count for a ticker
   */
  async getArticleCount(ticker: string): Promise<number> {
    return await ArticleRepository.countByTicker(ticker.toUpperCase());
  }

  /**
   * Get user's article count
   */
  async getUserArticleCount(userId: number): Promise<number> {
    return await ArticleRepository.countByUserId(userId);
  }

  /**
   * Get all articles (admin/overview)
   */
  async getAllArticles(): Promise<Article[]> {
    return await ArticleRepository.findAll();
  }
}

export default new ArticleService();
