import { SharedFile, ResearchFile, User } from '../models';
import { Op } from 'sequelize';

export interface SharedFileData {
  fileId: number;
  sharedByUserId: number;
  sharedWithUserId: number;
}

/**
 * SharedFile Repository - handles file sharing operations
 */
export class SharedFileRepository {
  /**
   * Share a file with a user
   */
  async create(data: SharedFileData): Promise<SharedFile> {
    return await SharedFile.create(data);
  }

  /**
   * Share a file with multiple users
   */
  async shareWithMultiple(fileId: number, sharedByUserId: number, userIds: number[]): Promise<SharedFile[]> {
    const shares = await Promise.all(
      userIds.map(userId =>
        SharedFile.findOrCreate({
          where: {
            fileId,
            sharedWithUserId: userId,
          },
          defaults: {
            fileId,
            sharedByUserId,
            sharedWithUserId: userId,
          },
        })
      )
    );
    return shares.map(([share]) => share);
  }

  /**
   * Unshare a file from a specific user
   */
  async unshare(fileId: number, sharedWithUserId: number): Promise<boolean> {
    const deleted = await SharedFile.destroy({
      where: {
        fileId,
        sharedWithUserId,
      },
    });
    return deleted > 0;
  }

  /**
   * Get all users a file is shared with
   */
  async getSharedWith(fileId: number): Promise<User[]> {
    const shares = await SharedFile.findAll({
      where: { fileId },
      include: [
        {
          model: User,
          as: 'sharedWith',
          attributes: ['id', 'username', 'displayName'],
        },
      ],
    });
    return shares.map(share => (share as any).sharedWith);
  }

  /**
   * Get all files shared with a user
   */
  async getFilesSharedWithUser(userId: number): Promise<ResearchFile[]> {
    const shares = await SharedFile.findAll({
      where: { sharedWithUserId: userId },
      include: [
        {
          model: ResearchFile,
          as: 'file',
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'displayName'],
            },
          ],
        },
      ],
      order: [['sharedAt', 'DESC']],
    });
    return shares.map(share => (share as any).file);
  }

  /**
   * Check if a file is shared with a specific user
   */
  async isSharedWith(fileId: number, userId: number): Promise<boolean> {
    const share = await SharedFile.findOne({
      where: {
        fileId,
        sharedWithUserId: userId,
      },
    });
    return !!share;
  }

  /**
   * Get all shares for a file
   */
  async findByFileId(fileId: number): Promise<SharedFile[]> {
    return await SharedFile.findAll({
      where: { fileId },
      include: [
        {
          model: User,
          as: 'sharedWith',
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: User,
          as: 'sharedBy',
          attributes: ['id', 'username', 'displayName'],
        },
      ],
      order: [['sharedAt', 'DESC']],
    });
  }

  /**
   * Remove all shares for a file
   */
  async deleteAllForFile(fileId: number): Promise<number> {
    return await SharedFile.destroy({
      where: { fileId },
    });
  }

  /**
   * Count how many users a file is shared with
   */
  async countShares(fileId: number): Promise<number> {
    return await SharedFile.count({
      where: { fileId },
    });
  }
}

export default new SharedFileRepository();
