import { Request, Response } from 'express';
import fileService from '../services/fileService';

/**
 * File Controller - Handles file upload/download/delete requests
 */

/**
 * Upload file for a stock ticker
 * POST /api/files/:ticker/upload
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Upload file to local storage
    const file = await fileService.uploadFile({
      ticker: ticker.toUpperCase(),
      userId,
      file: req.file,
      source: req.body.source || 'manual',
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file.id,
        ticker: file.ticker,
        filename: file.filename,
        fileType: file.fileType,
        fileSize: file.fileSize,
        source: file.source,
        uploadedAt: file.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to upload file' 
    });
  }
};

/**
 * Get all files for a stock ticker
 * GET /api/files/:ticker
 */
export const getFilesByTicker = async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker as string;

    const files = await fileService.getFilesByTicker(ticker.toUpperCase());

    return res.json({
      ticker,
      count: files.length,
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        fileType: file.fileType,
        fileSize: file.fileSize,
        source: file.source,
        uploadedAt: file.uploadedAt,
        user: {
          id: (file as any).User?.id,
          username: (file as any).User?.username,
          displayName: (file as any).User?.displayName,
        },
      })),
    });
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch files' 
    });
  }
};

/**
 * Get download URL for a file
 * GET /api/files/:id/download
 */
export const getDownloadUrl = async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id as string);
    const redirect = req.query.redirect === 'true';

    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Get file metadata to check if it exists
    const file = await fileService.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // For local storage, the download URL points to our serve endpoint
    const downloadUrl = `/api/files/${fileId}/serve`;

    // Either redirect to the URL or return it as JSON
    if (redirect) {
      return res.redirect(downloadUrl);
    } else {
      return res.json({
        fileId,
        filename: file.filename,
        downloadUrl,
      });
    }
  } catch (error: any) {
    console.error('Error generating download URL:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate download URL' 
    });
  }
};

/**
 * Serve file directly (stream file from local storage)
 * GET /api/files/:id/serve
 */
export const serveFile = async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id as string);

    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Get file data
    const { buffer, filename, mimeType } = await fileService.getFileBuffer(fileId);

    // Set headers for download
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  } catch (error: any) {
    console.error('Error serving file:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to serve file' 
    });
  }
};

/**
 * Delete file
 * DELETE /api/files/:id
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id as string);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Delete file from local storage (includes ownership check)
    await fileService.deleteFile(fileId, userId);

    return res.json({
      message: 'File deleted successfully',
      fileId,
    });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (error.message.includes('permission')) {
      return res.status(403).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to delete file' 
    });
  }
};

/**
 * Get all files uploaded by current user
 * GET /api/files/user/me
 */
export const getMyFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const files = await fileService.getFilesByUser(userId);

    return res.json({
      userId,
      count: files.length,
      files: files.map(file => ({
        id: file.id,
        ticker: file.ticker,
        filename: file.filename,
        fileType: file.fileType,
        fileSize: file.fileSize,
        source: file.source,
        uploadedAt: file.uploadedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching user files:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch files' 
    });
  }
};

/**
 * Get user's storage usage
 * GET /api/files/user/storage
 */
export const getStorageUsage = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const totalBytes = await fileService.getUserStorageUsage(userId);
    const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

    return res.json({
      userId,
      totalBytes,
      totalMB: parseFloat(totalMB),
      maxMB: 50, // Max file size per upload
    });
  } catch (error: any) {
    console.error('Error fetching storage usage:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch storage usage' 
    });
  }
};

/**
 * Share a file with one or more users
 * POST /api/files/:id/share
 * Body: { userIds: number[] }
 */
export const shareFile = async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id as string);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    }

    await fileService.shareFile(fileId, userId, userIds);

    return res.json({
      message: 'File shared successfully',
      sharedWith: userIds
    });
  } catch (error: any) {
    console.error('Error sharing file:', error);

    if (error.message?.includes('Unauthorized')) {
      return res.status(403).json({ error: 'You do not have permission to share this file' });
    }

    return res.status(500).json({
      error: error.message || 'Failed to share file'
    });
  }
};

/**
 * Unshare a file from a specific user
 * DELETE /api/files/:id/share/:userId
 */
export const unshareFile = async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(fileId) || isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid file or user ID' });
    }

    await fileService.unshareFile(fileId, userId, targetUserId);

    return res.json({ message: 'File unshared successfully' });
  } catch (error: any) {
    console.error('Error unsharing file:', error);

    if (error.message?.includes('Unauthorized')) {
      return res.status(403).json({ error: 'You do not have permission to unshare this file' });
    }

    return res.status(500).json({
      error: error.message || 'Failed to unshare file'
    });
  }
};

/**
 * Get list of users a file is shared with
 * GET /api/files/:id/shared-with
 */
export const getSharedWith = async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id as string);
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const users = await fileService.getSharedWith(fileId, userId);

    return res.json({
      fileId,
      sharedWith: users.map((user: any) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
      }))
    });
  } catch (error: any) {
    console.error('Error fetching shared users:', error);

    if (error.message?.includes('Unauthorized')) {
      return res.status(403).json({ error: 'You do not have permission to view this information' });
    }

    return res.status(500).json({
      error: error.message || 'Failed to fetch shared users'
    });
  }
};

/**
 * Get all files shared with the current user
 * GET /api/files/shared
 */
export const getSharedFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const files = await fileService.getSharedFiles(userId);

    return res.json({
      count: files.length,
      files: files.map(file => ({
        id: file.id,
        ticker: file.ticker,
        filename: file.filename,
        fileType: file.fileType,
        fileSize: file.fileSize,
        source: file.source,
        visibility: file.visibility,
        uploadedAt: file.uploadedAt,
        user: {
          id: (file as any).User?.id,
          username: (file as any).User?.username,
          displayName: (file as any).User?.displayName,
        },
      })),
    });
  } catch (error: any) {
    console.error('Error fetching shared files:', error);
    return res.status(500).json({
      error: 'Failed to fetch shared files'
    });
  }
};
