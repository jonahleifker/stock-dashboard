import express from 'express';
import passport from '../auth/passport';
import noteController from '../controllers/noteController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Note Routes
 * 
 * All routes are prefixed with /api/notes
 */

// GET /api/notes/user/:userId - Get all notes by a user (public)
// This must come before /:ticker to avoid route collision
router.get('/user/:userId', noteController.getNotesByUser);

// PUT /api/notes/:id - Update note (requires auth + ownership)
router.put('/:id',
  authenticate,
  noteController.updateNote
);

// DELETE /api/notes/:id - Delete note (requires auth + ownership)
router.delete('/:id',
  authenticate,
  noteController.deleteNote
);

// GET /api/notes/:ticker - Get all notes for a stock (public)
router.get('/:ticker', noteController.getNotesByTicker);

// POST /api/notes/:ticker - Create new note (requires auth)
router.post('/:ticker',
  authenticate,
  noteController.createNote
);

export default router;
