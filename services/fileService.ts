import fs from 'fs';
import path from 'path';
import ResearchFileRepository from '../repositories/ResearchFileRepository';
import SharedFileRepository from '../repositories/SharedFileRepository';
import { ResearchFile, User } from '../models';

// Base directory for file uploads (relative to project root)
const UPLOADS_DIR = process.env.UPLOADS_DIR || './var/uploads';

export interface FileUploadData {
  ticker: string;
  userId: number;
  file: Express.Multer.File;
  source?: 'manual' | 'manus';
}

export interface FileDownloadData {
  id: number;
  expiresIn?: number; // Not used for local storage, kept for API compatibility
}

/**
 * File Service - Handles local filesystem operations and file metadata
 */
export class FileService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_MIME_TYPES = [
    // PDF
    'application/pdf',
    // Word documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel/CSV
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    // Text files
    'text/plain',
    'text/markdown',
    // Images
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  private readonly ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', 
    '.txt', '.md', '.png', '.jpg', '.jpeg'
  ];

  /**
   * Ensure the uploads directory exists
   */
  private ensureUploadsDir(subPath: string = ''): string {
    const fullPath = path.join(UPLOADS_DIR, subPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  }

  /**
   * Local storage is always configured (no external service needed)
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type '${file.mimetype}' is not allowed. Allowed types: PDF, Word, Excel, CSV, Text, Images`,
      };
    }

    // Check file extension
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `File extension '${ext}' is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload file to local filesystem
   */
  async uploadFile(data: FileUploadData): Promise<ResearchFile> {
    // Validate file
    const validation = this.validateFile(data.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique file path: ticker/userId/timestamp-filename
    const timestamp = Date.now();
    const sanitizedFilename = data.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const relativePath = `${data.ticker}/${data.userId}`;
    const filename = `${timestamp}-${sanitizedFilename}`;
    
    // Ensure directory exists
    const uploadDir = this.ensureUploadsDir(relativePath);
    const fullFilePath = path.join(uploadDir, filename);
    const storedPath = path.join(relativePath, filename);

    // Write file to disk
    await fs.promises.writeFile(fullFilePath, data.file.buffer);

    // Get file extension for fileType
    const ext = data.file.originalname.substring(data.file.originalname.lastIndexOf('.') + 1);

    // Save metadata to database (using supabasePath field to store local path)
    const fileRecord = await ResearchFileRepository.create({
      ticker: data.ticker,
      userId: data.userId,
      filename: data.file.originalname,
      fileType: ext,
      supabasePath: storedPath, // Storing local path here
      fileSize: data.file.size,
      source: data.source || 'manual',
    });

    return fileRecord;
  }

  /**
   * Get the full local path for a file
   */
  getFilePath(storedPath: string): string {
    return path.join(UPLOADS_DIR, storedPath);
  }

  /**
   * Get download URL for a file (returns local path for serving)
   * For local storage, we return a relative URL that the server will serve
   */
  async getDownloadUrl(data: FileDownloadData): Promise<string> {
    // Get file metadata
    const file = await ResearchFileRepository.findById(data.id);
    if (!file) {
      throw new Error('File not found');
    }

    // Return a URL path that the server can serve
    // The actual file serving happens in the controller/route
    return `/api/files/${data.id}/serve`;
  }

  /**
   * Get file buffer for downloading
   */
  async getFileBuffer(fileId: number): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const file = await ResearchFileRepository.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const fullPath = this.getFilePath(file.supabasePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found on disk');
    }

    const buffer = await fs.promises.readFile(fullPath);
    
    // Determine MIME type from extension
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
    };

    return {
      buffer,
      filename: file.filename,
      mimeType: mimeTypes[file.fileType] || 'application/octet-stream',
    };
  }

  /**
   * Delete file from local filesystem and database
   */
  async deleteFile(fileId: number, userId: number): Promise<boolean> {
    // Get file metadata
    const file = await ResearchFileRepository.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Check ownership
    if (file.userId !== userId) {
      throw new Error('You do not have permission to delete this file');
    }

    const fullPath = this.getFilePath(file.supabasePath);

    // Delete from filesystem (if exists)
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }

    // Delete metadata from database
    await ResearchFileRepository.delete(fileId);

    return true;
  }

  /**
   * Get all files for a ticker
   */
  async getFilesByTicker(ticker: string): Promise<ResearchFile[]> {
    return await ResearchFileRepository.findByTicker(ticker);
  }

  /**
   * Get all files by a user
   */
  async getFilesByUser(userId: number): Promise<ResearchFile[]> {
    return await ResearchFileRepository.findByUserId(userId);
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: number): Promise<ResearchFile | null> {
    return await ResearchFileRepository.findById(fileId);
  }

  /**
   * Check if user owns file
   */
  async isFileOwner(fileId: number, userId: number): Promise<boolean> {
    return await ResearchFileRepository.isOwner(fileId, userId);
  }

  /**
   * Get user's total storage usage
   */
  async getUserStorageUsage(userId: number): Promise<number> {
    return await ResearchFileRepository.getTotalStorageByUser(userId);
  }

  /**
   * Share a file with one or more users
   */
  async shareFile(fileId: number, ownerId: number, userIds: number[]): Promise<void> {
    // Check ownership
    const isOwner = await ResearchFileRepository.isOwner(fileId, ownerId);
    if (!isOwner) {
      throw new Error('Unauthorized: User does not own this file');
    }

    // Get the file
    const file = await ResearchFileRepository.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Update visibility to 'shared' if it's currently 'private'
    if (file.visibility === 'private') {
      await ResearchFileRepository.update(fileId, { visibility: 'shared' } as any);
    }

    // Share with specified users
    await SharedFileRepository.shareWithMultiple(fileId, ownerId, userIds);
  }

  /**
   * Unshare a file from a specific user
   */
  async unshareFile(fileId: number, ownerId: number, targetUserId: number): Promise<void> {
    // Check ownership
    const isOwner = await ResearchFileRepository.isOwner(fileId, ownerId);
    if (!isOwner) {
      throw new Error('Unauthorized: User does not own this file');
    }

    await SharedFileRepository.unshare(fileId, targetUserId);

    // If no more shares exist, update visibility back to 'private'
    const shareCount = await SharedFileRepository.countShares(fileId);
    if (shareCount === 0) {
      await ResearchFileRepository.update(fileId, { visibility: 'private' } as any);
    }
  }

  /**
   * Get all users a file is shared with
   */
  async getSharedWith(fileId: number, userId: number): Promise<User[]> {
    // Check ownership
    const isOwner = await ResearchFileRepository.isOwner(fileId, userId);
    if (!isOwner) {
      throw new Error('Unauthorized: User does not own this file');
    }

    return await SharedFileRepository.getSharedWith(fileId);
  }

  /**
   * Get all files shared with a user
   */
  async getSharedFiles(userId: number): Promise<ResearchFile[]> {
    return await SharedFileRepository.getFilesSharedWithUser(userId);
  }

  /**
   * Check if a user can access a file (owner or shared with)
   */
  async canAccessFile(fileId: number, userId: number): Promise<boolean> {
    const isOwner = await ResearchFileRepository.isOwner(fileId, userId);
    if (isOwner) return true;

    const isShared = await SharedFileRepository.isSharedWith(fileId, userId);
    return isShared;
  }
}

export default new FileService();
