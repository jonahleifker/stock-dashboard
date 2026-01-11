import express from 'express';
import passport from 'passport';
import * as articleController from '../controllers/articleController';

const router = express.Router();

// Middleware to require authentication
const requireAuth = passport.authenticate('jwt', { session: false });

/**
 * Article Routes
 */

// Get current user's articles
router.get('/user/me', requireAuth, articleController.getMyArticles);

// Get article by ID
router.get('/id/:id', articleController.getArticleById);

// Get all articles for a ticker
router.get('/:ticker', articleController.getArticlesByTicker);

// Create new article for a ticker
router.post('/:ticker', requireAuth, articleController.createArticle);

// Update an article
router.put('/:id', requireAuth, articleController.updateArticle);

// Delete an article
router.delete('/:id', requireAuth, articleController.deleteArticle);

export default router;
