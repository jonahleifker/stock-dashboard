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

    // Check if Supabase is configured
    if (!fileService.isConfigured()) {
      return res.status(503).json({ 
        error: 'File upload service is not configured. Please contact administrator.' 
      });
    }

    // Upload file
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

    // Check if Supabase is configured
    if (!fileService.isConfigured()) {
      return res.status(503).json({ 
        error: 'File download service is not configured' 
      });
    }

    // Get file metadata to check if it exists
    const file = await fileService.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate download URL
    const downloadUrl = await fileService.getDownloadUrl({ 
      id: fileId,
      expiresIn: 3600, // 1 hour
    });

    // Either redirect to the URL or return it as JSON
    if (redirect) {
      return res.redirect(downloadUrl);
    } else {
      return res.json({
        fileId,
        filename: file.filename,
        downloadUrl,
        expiresIn: 3600,
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

    // Check if Supabase is configured
    if (!fileService.isConfigured()) {
      return res.status(503).json({ 
        error: 'File service is not configured' 
      });
    }

    // Delete file (includes ownership check)
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
