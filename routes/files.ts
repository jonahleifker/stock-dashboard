import express from 'express';
import multer from 'multer';
import passport from 'passport';
import * as fileController from '../controllers/fileController';

const router = express.Router();

// Configure multer for memory storage (we'll upload to Supabase, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// Middleware to require authentication
const requireAuth = passport.authenticate('jwt', { session: false });

/**
 * File Routes
 */

// Upload file for a specific ticker
router.post('/:ticker/upload', requireAuth, upload.single('file'), fileController.uploadFile);

// Get all files for a ticker
router.get('/:ticker', fileController.getFilesByTicker);

// Get download URL for a file
router.get('/:id/download', fileController.getDownloadUrl);

// Delete a file
router.delete('/:id', requireAuth, fileController.deleteFile);

// Get current user's files
router.get('/user/me', requireAuth, fileController.getMyFiles);

// Get current user's storage usage
router.get('/user/storage', requireAuth, fileController.getStorageUsage);

export default router;
