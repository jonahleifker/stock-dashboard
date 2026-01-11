import express from 'express';
import passport from '../auth/passport';
import * as researchController from '../controllers/researchController';

const router = express.Router();

/**
 * Research Routes - Manus AI Integration
 * 
 * All routes require JWT authentication except status check
 */

// Middleware to require JWT authentication
const requireAuth = passport.authenticate('jwt', { session: false });

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

export default router;
