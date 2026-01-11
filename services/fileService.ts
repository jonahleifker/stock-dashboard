import { getSupabaseClient, isSupabaseConfigured, STORAGE_BUCKET } from '../config/supabase';
import ResearchFileRepository from '../repositories/ResearchFileRepository';
import { ResearchFile } from '../models';

export interface FileUploadData {
  ticker: string;
  userId: number;
  file: Express.Multer.File;
  source?: 'manual' | 'manus';
}

export interface FileDownloadData {
  id: number;
  expiresIn?: number; // seconds, default 3600 (1 hour)
}

/**
 * File Service - Handles Supabase Storage operations and file metadata
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
   * Check if Supabase is configured
   */
  isConfigured(): boolean {
    return isSupabaseConfigured();
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
   * Upload file to Supabase Storage
   */
  async uploadFile(data: FileUploadData): Promise<ResearchFile> {
    if (!this.isConfigured()) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
    }

    // Validate file
    const validation = this.validateFile(data.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const supabase = getSupabaseClient();

    // Generate unique file path: ticker/userId/timestamp-filename
    const timestamp = Date.now();
    const sanitizedFilename = data.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${data.ticker}/${data.userId}/${timestamp}-${sanitizedFilename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, data.file.buffer, {
        contentType: data.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file to Supabase: ${uploadError.message}`);
    }

    // Get file extension for fileType
    const ext = data.file.originalname.substring(data.file.originalname.lastIndexOf('.') + 1);

    // Save metadata to database
    const fileRecord = await ResearchFileRepository.create({
      ticker: data.ticker,
      userId: data.userId,
      filename: data.file.originalname,
      fileType: ext,
      supabasePath: uploadData.path,
      fileSize: data.file.size,
      source: data.source || 'manual',
    });

    return fileRecord;
  }

  /**
   * Get download URL for a file
   */
  async getDownloadUrl(data: FileDownloadData): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    // Get file metadata
    const file = await ResearchFileRepository.findById(data.id);
    if (!file) {
      throw new Error('File not found');
    }

    const supabase = getSupabaseClient();

    // Generate signed URL (expires in 1 hour by default)
    const { data: urlData, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(file.supabasePath, data.expiresIn || 3600);

    if (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }

    return urlData.signedUrl;
  }

  /**
   * Delete file from Supabase Storage and database
   */
  async deleteFile(fileId: number, userId: number): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    // Get file metadata
    const file = await ResearchFileRepository.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Check ownership
    if (file.userId !== userId) {
      throw new Error('You do not have permission to delete this file');
    }

    const supabase = getSupabaseClient();

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([file.supabasePath]);

    if (deleteError) {
      throw new Error(`Failed to delete file from Supabase: ${deleteError.message}`);
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
}

export default new FileService();
