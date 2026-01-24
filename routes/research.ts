import express from 'express';
import passport from '../auth/passport';
import * as researchController from '../controllers/researchController';

import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Research Routes - Manus AI Integration
 * 
 * All routes require JWT authentication except status check
 */

// Middleware to require JWT authentication
const requireAuth = authenticate;

/**
 * GET /api/research/status
 * Check if Manus AI integration is enabled
 * Public endpoint - no auth required
 */
router.get('/status', researchController.getManusStatus);

/**
 * GET /api/research/user/me
 * Get all research requests by current user
 * Requires authentication
 */
router.get('/user/me', requireAuth, researchController.getMyResearchRequests);

/**
 * GET /api/research/result/:requestId
 * Get research result by request ID
 * Requires authentication
 */
router.get('/result/:requestId', requireAuth, researchController.getResearchResult);

/**
 * PATCH /api/research/result/:requestId
 * Update research result (e.g. save notes)
 * Requires authentication and ownership
 */
router.patch('/result/:requestId', requireAuth, researchController.updateResearchResult);

/**
 * POST /api/research/:ticker/request
 * Initiate new research request for a ticker
 * Requires authentication
 * Body: { requestType?: string, parameters?: object }
 */
router.post('/:ticker/request', requireAuth, researchController.requestResearch);

/**
 * GET /api/research/:ticker/status/:requestId
 * Get status of a specific research request
 * Returns request status and result if completed
 * Requires authentication
 */
router.get('/:ticker/status/:requestId', requireAuth, researchController.getRequestStatus);

/**
 * POST /api/research/:ticker/cancel/:requestId
 * Cancel a research request
 * Requires authentication and ownership
 */
router.post('/:ticker/cancel/:requestId', requireAuth, researchController.cancelResearch);

/**
 * GET /api/research/:ticker
 * Get all completed research for a ticker
 * Requires authentication
 */
router.get('/:ticker', requireAuth, researchController.getResearchByTicker);

/**
 * POST /api/research/portfolio
 * Analyze portfolio holdings with AI
 * Requires authentication
 */
router.post('/portfolio', requireAuth, researchController.analyzePortfolio);

/**
 * POST /api/research/news/analyze
 * Analyze news article
 * Requires authentication
 */
router.post('/news/analyze', requireAuth, researchController.analyzeNews);

export default router;
