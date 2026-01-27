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

// GET /api/notes/shared - Get notes shared with me (requires auth)
// This must come before other routes to avoid route collision
router.get('/shared',
  authenticate,
  noteController.getSharedNotes
);

// GET /api/notes/user/:userId - Get all notes by a user (public)
router.get('/user/:userId', noteController.getNotesByUser);

// POST /api/notes/:id/share - Share note with users (requires auth + ownership)
router.post('/:id/share',
  authenticate,
  noteController.shareNote
);

// DELETE /api/notes/:id/share/:userId - Unshare note from user (requires auth + ownership)
router.delete('/:id/share/:userId',
  authenticate,
  noteController.unshareNote
);

// GET /api/notes/:id/shared-with - Get users note is shared with (requires auth + ownership)
router.get('/:id/shared-with',
  authenticate,
  noteController.getSharedWith
);

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
