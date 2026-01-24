import { Request, Response } from 'express';
import manusService from '../services/manusService';
import stockService from '../services/stockService';
import favoriteService from '../services/favoriteService';

/**
 * Research Controller - Handles Manus AI research requests
 */

/**
 * Initiate research request for a stock ticker
 * POST /api/research/:ticker/request
 */
export const requestResearch = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { requestType, parameters } = req.body;

    // Validate ticker
    if (!ticker || ticker.trim().length === 0) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    // Fetch current price
    let currentPrice: number | undefined;
    try {
      const stock = await stockService.getStock(ticker);
      if (stock && stock.currentPrice) {
        currentPrice = stock.currentPrice;
      }
    } catch (err) {
      console.warn('Failed to fetch current price for research context:', err);
    }

    // Create research request
    const request = await manusService.requestResearch(
      ticker,
      userId,
      requestType || 'comprehensive',
      parameters,
      currentPrice
    );

    return res.status(201).json({
      message: manusService.isManusEnabled()
        ? 'Research request submitted successfully'
        : 'Research request created (mock mode - add MANUS_API_KEY to enable real integration)',
      request: {
        id: request.id,
        ticker: request.ticker,
        status: request.status,
        requestType: request.requestType,
        createdAt: request.createdAt,
      },
      manusEnabled: manusService.isManusEnabled(),
    });
  } catch (error: any) {
    console.error('Error requesting research:', error);
    return res.status(500).json({
      error: error.message || 'Failed to submit research request'
    });
  }
};

/**
 * Get status of a research request
 * GET /api/research/:ticker/status/:requestId
 */
export const getRequestStatus = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;
    const requestId = req.params.requestId as string;

    const request = await manusService.getRequestStatus(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Research request not found'
      });
    }

    // Check if ticker matches
    if (request.ticker.toUpperCase() !== ticker.toUpperCase()) {
      return res.status(400).json({
        error: 'Ticker mismatch'
      });
    }

    // If completed, also return the result
    let result = null;
    if (request.status === 'completed') {
      result = await manusService.getResearchResult(requestId);
    }

    return res.json({
      request: {
        id: request.id,
        ticker: request.ticker,
        status: request.status,
        requestType: request.requestType,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        completedAt: request.completedAt,
        errorMessage: request.errorMessage,
      },
      result: result ? {
        requestId: result.requestId,
        ticker: result.ticker,
        summary: result.summary,
        keyFindings: result.keyFindings,
        priceScenarios: result.priceScenarios,
        catalysts: result.catalysts,
        risks: result.risks,
        financialData: result.financialData,
        sentiment: result.sentiment,
        sources: result.sources,
        generatedFiles: result.generatedFiles,
        completedAt: result.completedAt,
      } : null,
      manusEnabled: manusService.isManusEnabled(),
    });
  } catch (error: any) {
    console.error('Error fetching request status:', error);
    return res.status(500).json({
      error: 'Failed to fetch request status'
    });
  }
};

/**
 * Get all completed research for a stock ticker
 * GET /api/research/:ticker
 */
export const getResearchByTicker = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;

    const results = await manusService.getResearchByTicker(ticker);

    return res.json({
      ticker: ticker.toUpperCase(),
      count: results.length,
      results: results.map(result => ({
        requestId: result.requestId,
        ticker: result.ticker,
        summary: result.summary,
        keyFindings: result.keyFindings,
        priceScenarios: result.priceScenarios,
        catalysts: result.catalysts,
        risks: result.risks,
        financialData: result.financialData,
        sentiment: result.sentiment,
        sources: result.sources,
        generatedFiles: result.generatedFiles,
        completedAt: result.completedAt,
      })),
      manusEnabled: manusService.isManusEnabled(),
    });
  } catch (error: any) {
    console.error('Error fetching research:', error);
    return res.status(500).json({
      error: 'Failed to fetch research results'
    });
  }
};

/**
 * Get all research requests by current user
 * GET /api/research/user/me
 */
export const getMyResearchRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requests = await manusService.getResearchByUser(userId);

    return res.json({
      userId,
      count: requests.length,
      requests: requests.map(request => ({
        id: request.id,
        ticker: request.ticker,
        status: request.status,
        requestType: request.requestType,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        completedAt: request.completedAt,
        errorMessage: request.errorMessage,
      })),
      manusEnabled: manusService.isManusEnabled(),
    });
  } catch (error: any) {
    console.error('Error fetching user research requests:', error);
    return res.status(500).json({
      error: 'Failed to fetch research requests'
    });
  }
};

/**
 * Get research result by request ID
 * GET /api/research/result/:requestId
 */
export const getResearchResult = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId as string;

    // Check request exists
    const request = await manusService.getRequestStatus(requestId);
    if (!request) {
      return res.status(404).json({
        error: 'Research request not found'
      });
    }

    // Check if completed
    if (request.status !== 'completed') {
      return res.status(400).json({
        error: `Research is not complete. Current status: ${request.status}`,
        status: request.status,
      });
    }

    // Get result
    const result = await manusService.getResearchResult(requestId);
    if (!result) {
      return res.status(404).json({
        error: 'Research result not found'
      });
    }

    return res.json({
      result: {
        requestId: result.requestId,
        ticker: result.ticker,
        summary: result.summary,
        keyFindings: result.keyFindings,
        priceScenarios: result.priceScenarios,
        catalysts: result.catalysts,
        risks: result.risks,
        financialData: result.financialData,
        sentiment: result.sentiment,
        sources: result.sources,
        generatedFiles: result.generatedFiles,
        completedAt: result.completedAt,
      },
      manusEnabled: manusService.isManusEnabled(),
    });
  } catch (error: any) {
    console.error('Error fetching research result:', error);
    return res.status(500).json({
      error: 'Failed to fetch research result'
    });
  }
};

/**
 * Update research result (e.g. save user notes)
 * PATCH /api/research/result/:requestId
 */
export const updateResearchResult = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId as string;
    const updates = req.body;

    // Check if result exists
    const result = await manusService.getResearchResult(requestId);
    if (!result) {
      return res.status(404).json({
        error: 'Research result not found'
      });
    }

    // Verify ownership via request
    const request = await manusService.getRequestStatus(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check user permission
    const userId = (req.user as any)?.id;
    if (request.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this research' });
    }

    // Perform update
    // Only allow specific fields to be updated for security
    const allowedUpdates: any = {};
    if (updates.userNotes !== undefined) allowedUpdates.userNotes = updates.userNotes;
    if (updates.summary !== undefined) allowedUpdates.summary = updates.summary; // Allow editing summary if desired

    const updatedResult = await manusService.updateResearchResult(requestId, allowedUpdates);

    return res.json({
      message: 'Research updated successfully',
      result: updatedResult
    });
  } catch (error: any) {
    console.error('Error updating research result:', error);
    return res.status(500).json({
      error: 'Failed to update research result'
    });
  }
};

/**
 * Cancel a research request
 * POST /api/research/:ticker/cancel/:requestId
 */
export const cancelResearch = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;
    const requestId = req.params.requestId as string;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await manusService.cancelRequest(requestId, userId);

    return res.json({
      message: 'Research request cancelled successfully',
      requestId,
    });
  } catch (error: any) {
    console.error('Error cancelling research:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes('permission')) {
      return res.status(403).json({ error: error.message });
    }

    if (error.message.includes('Cannot cancel')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: error.message || 'Failed to cancel research request'
    });
  }
};

/**
 * Get Manus integration status
 * GET /api/research/status
 */
export const getManusStatus = async (req: Request, res: Response) => {
  try {
    const isEnabled = manusService.isManusEnabled();

    return res.json({
      manusEnabled: isEnabled,
      message: isEnabled
        ? 'Manus AI integration is enabled'
        : 'Manus AI integration is disabled. Add MANUS_API_KEY to .env to enable.',
      apiUrl: process.env.MANUS_API_URL || 'https://api.manus.ai',
    });
  } catch (error: any) {
    console.error('Error checking Manus status:', error);
    return res.status(500).json({
      error: 'Failed to check Manus status'
    });
  }
};


/**
 * Analyze portfolio (AI Insights)
 * POST /api/research/portfolio
 */
export const analyzePortfolio = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 1. Get user favorites
    const favorites = await favoriteService.getFavorites(userId);

    if (!favorites || favorites.length === 0) {
      return res.status(400).json({ error: 'No favorites found. Add stocks to your portfolio first.' });
    }

    // 2. Hydrate with current prices (in parallel)
    const holdings = await Promise.all(favorites.map(async (fav: any) => {
      let currentPrice = 0;
      try {
        const stock = await stockService.getStock(fav.ticker);
        currentPrice = stock?.currentPrice || 0;
      } catch (e) {
        console.warn(`Failed to fetch price for ${fav.ticker}`, e);
      }

      return {
        ticker: fav.ticker,
        shares: fav.shares || 0,
        avgPrice: fav.averagePrice || 0,
        currentPrice
      };
    }));

    // Filter out stocks with no shares/price if desired, or keep all for completeness
    // For analysis, we probably only care about what they own or are tracking

    // 3. Call AI service
    const analysis = await manusService.analyzePortfolio(holdings);

    return res.json({
      analysis,
      manusEnabled: manusService.isManusEnabled()
    });

  } catch (error: any) {
    console.error('Error analyzing portfolio:', error);
    return res.status(500).json({ error: 'Failed to analyze portfolio' });
  }
};

/**
 * Analyze news article (AI Insights)
 * POST /api/research/news/analyze
 */
export const analyzeNews = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, url, publisher, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Article title is required' });
    }

    // Try to fetch content if URL provided and content missing
    let articleContent = content || null;
    if (url && !articleContent) {
      try {
        // Simple fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          // Very simple HTML stripping (or just pass HTML to OpenAI, it handles it well)
          // But to save tokens, maybe strip tags?
          // OpenAI is good with raw HTML but it uses more tokens.
          // Let's do a basic strip.
          articleContent = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 15000); // Cap length
        }
      } catch (e) {
        console.warn('Failed to fetch article content:', e);
        // Continue with just title
      }
    }

    const analysis = await manusService.analyzeNews(title, articleContent, publisher || 'Unknown');

    return res.json({
      analysis,
      manusEnabled: manusService.isManusEnabled()
    });

  } catch (error: any) {
    console.error('Error analyzing news:', error);
    return res.status(500).json({ error: 'Failed to analyze news' });
  }
};

