import express from 'express';
import multer from 'multer';
import passport from 'passport';
import * as fileController from '../controllers/fileController';

const router = express.Router();

// Configure multer for memory storage (files are written to disk by fileService)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// Middleware to require authentication
const requireAuth = passport.authenticate('jwt', { session: false });

/**
 * File Routes - Local filesystem storage
 */

// Get files shared with me (must come before /:ticker route)
router.get('/shared', requireAuth, fileController.getSharedFiles);

// Get current user's files (must come before /:ticker route)
router.get('/user/me', requireAuth, fileController.getMyFiles);

// Get current user's storage usage
router.get('/user/storage', requireAuth, fileController.getStorageUsage);

// Upload file for a specific ticker
router.post('/:ticker/upload', requireAuth, upload.single('file'), fileController.uploadFile);

// Get all files for a ticker
router.get('/:ticker', fileController.getFilesByTicker);

// Share file with users
router.post('/:id/share', requireAuth, fileController.shareFile);

// Unshare file from user
router.delete('/:id/share/:userId', requireAuth, fileController.unshareFile);

// Get users file is shared with
router.get('/:id/shared-with', requireAuth, fileController.getSharedWith);

// Serve file directly (stream from local storage)
router.get('/:id/serve', fileController.serveFile);

// Get download URL for a file
router.get('/:id/download', fileController.getDownloadUrl);

// Delete a file
router.delete('/:id', requireAuth, fileController.deleteFile);

export default router;
