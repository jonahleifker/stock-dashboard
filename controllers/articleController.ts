import { Request, Response } from 'express';
import articleService from '../services/articleService';

/**
 * Article Controller - Handles article/link requests
 */

/**
 * Get all articles for a stock ticker
 * GET /api/articles/:ticker
 */
export const getArticlesByTicker = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;

    const articles = await articleService.getArticlesByTicker(ticker);

    return res.json({
      ticker: ticker.toUpperCase(),
      count: articles.length,
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        addedAt: article.addedAt,
        user: {
          id: (article as any).User?.id,
          username: (article as any).User?.username,
          displayName: (article as any).User?.displayName,
        },
      })),
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch articles' 
    });
  }
};

/**
 * Create a new article for a stock ticker
 * POST /api/articles/:ticker
 */
export const createArticle = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, url, sourceName, publishedAt } = req.body;

    // Validate required fields
    if (!title || !url) {
      return res.status(400).json({ 
        error: 'Title and URL are required' 
      });
    }

    // Create article
    const article = await articleService.createArticle({
      ticker,
      userId,
      title,
      url,
      sourceName,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    });

    return res.status(201).json({
      message: 'Article created successfully',
      article: {
        id: article.id,
        ticker: article.ticker,
        title: article.title,
        url: article.url,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        addedAt: article.addedAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating article:', error);
    
    if (error.message.includes('Invalid URL')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('required')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to create article' 
    });
  }
};

/**
 * Update an article
 * PUT /api/articles/:id
 */
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id as string);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const { title, url, sourceName, publishedAt } = req.body;

    // Update article
    const article = await articleService.updateArticle(articleId, userId, {
      title,
      url,
      sourceName,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    });

    return res.json({
      message: 'Article updated successfully',
      article: {
        id: article.id,
        ticker: article.ticker,
        title: article.title,
        url: article.url,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        addedAt: article.addedAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating article:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    if (error.message.includes('permission')) {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message.includes('Invalid URL')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to update article' 
    });
  }
};

/**
 * Delete an article
 * DELETE /api/articles/:id
 */
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id as string);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    // Delete article
    await articleService.deleteArticle(articleId, userId);

    return res.json({
      message: 'Article deleted successfully',
      articleId,
    });
  } catch (error: any) {
    console.error('Error deleting article:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    if (error.message.includes('permission')) {
      return res.status(403).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to delete article' 
    });
  }
};

/**
 * Get all articles by current user
 * GET /api/articles/user/me
 */
export const getMyArticles = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const articles = await articleService.getArticlesByUser(userId);

    return res.json({
      userId,
      count: articles.length,
      articles: articles.map(article => ({
        id: article.id,
        ticker: article.ticker,
        title: article.title,
        url: article.url,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        addedAt: article.addedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching user articles:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch articles' 
    });
  }
};

/**
 * Get article by ID
 * GET /api/articles/id/:id
 */
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id as string);

    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const article = await articleService.getArticleById(articleId);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    return res.json({
      article: {
        id: article.id,
        ticker: article.ticker,
        title: article.title,
        url: article.url,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        addedAt: article.addedAt,
        user: {
          id: (article as any).User?.id,
          username: (article as any).User?.username,
          displayName: (article as any).User?.displayName,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch article' 
    });
  }
};
