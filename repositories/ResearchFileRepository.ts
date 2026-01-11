import { ResearchFile, User } from '../models';

export interface ResearchFileData {
  ticker: string;
  userId: number;
  filename: string;
  fileType: string;
  supabasePath: string;
  fileSize?: number;
  source?: 'manual' | 'manus';
}

/**
 * ResearchFile Repository - handles all file metadata operations
 */
export class ResearchFileRepository {
  /**
   * Find file by ID
   */
  async findById(id: number): Promise<ResearchFile | null> {
    return await ResearchFile.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
    });
  }

  /**
   * Find all files for a stock ticker
   */
  async findByTicker(ticker: string): Promise<ResearchFile[]> {
    return await ResearchFile.findAll({
      where: { ticker },
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['uploadedAt', 'DESC']],
    });
  }

  /**
   * Find all files by a user
   */
  async findByUserId(userId: number): Promise<ResearchFile[]> {
    return await ResearchFile.findAll({
      where: { userId },
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['uploadedAt', 'DESC']],
    });
  }

  /**
   * Find files by source (manual or manus)
   */
  async findBySource(source: 'manual' | 'manus'): Promise<ResearchFile[]> {
    return await ResearchFile.findAll({
      where: { source },
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['uploadedAt', 'DESC']],
    });
  }

  /**
   * Create a new file record
   */
  async create(data: ResearchFileData): Promise<ResearchFile> {
    const file = await ResearchFile.create(data);
    return await this.findById(file.id) as ResearchFile;
  }

  /**
   * Update existing file record
   */
  async update(id: number, data: Partial<ResearchFileData>): Promise<ResearchFile | null> {
    const file = await ResearchFile.findByPk(id);
    if (!file) {
      return null;
    }
    await file.update(data);
    return await this.findById(id);
  }

  /**
   * Delete file record
   */
  async delete(id: number): Promise<boolean> {
    const deleted = await ResearchFile.destroy({
      where: { id },
    });
    return deleted > 0;
  }

  /**
   * Check if user owns file
   */
  async isOwner(fileId: number, userId: number): Promise<boolean> {
    const file = await ResearchFile.findByPk(fileId);
    return file?.userId === userId;
  }

  /**
   * Get all files (for admin/overview)
   */
  async findAll(): Promise<ResearchFile[]> {
    return await ResearchFile.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['uploadedAt', 'DESC']],
    });
  }

  /**
   * Count files for a ticker
   */
  async countByTicker(ticker: string): Promise<number> {
    return await ResearchFile.count({
      where: { ticker },
    });
  }

  /**
   * Count files by a user
   */
  async countByUserId(userId: number): Promise<number> {
    return await ResearchFile.count({
      where: { userId },
    });
  }

  /**
   * Get total storage used by user (in bytes)
   */
  async getTotalStorageByUser(userId: number): Promise<number> {
    const files = await ResearchFile.findAll({
      where: { userId },
      attributes: ['fileSize'],
    });
    
    return files.reduce((total, file) => total + (file.fileSize || 0), 0);
  }

  /**
   * Get file types statistics
   */
  async getFileTypeStats(): Promise<{ fileType: string; count: number }[]> {
    const result = await ResearchFile.findAll({
      attributes: [
        'fileType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['fileType'],
      raw: true,
    });
    
    return result as any;
  }
}

export default new ResearchFileRepository();
