import express from 'express';
import passport from '../auth/passport';
import favoriteController from '../controllers/favoriteController';

const router = express.Router();

// Require authentication for all favorite routes
import { authenticate } from '../middleware/auth';

// Require authentication for all favorite routes
router.use(authenticate);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.post('/bulk', favoriteController.addBulkFavorites);
router.put('/:id', favoriteController.updateFavorite);
router.delete('/:id', favoriteController.deleteFavorite);

export default router;
