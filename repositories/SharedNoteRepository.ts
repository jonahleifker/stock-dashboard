import { SharedNote, Note, User } from '../models';
import { Op } from 'sequelize';

export interface SharedNoteData {
  noteId: number;
  sharedByUserId: number;
  sharedWithUserId: number;
}

/**
 * SharedNote Repository - handles note sharing operations
 */
export class SharedNoteRepository {
  /**
   * Share a note with a user
   */
  async create(data: SharedNoteData): Promise<SharedNote> {
    return await SharedNote.create(data);
  }

  /**
   * Share a note with multiple users
   */
  async shareWithMultiple(noteId: number, sharedByUserId: number, userIds: number[]): Promise<SharedNote[]> {
    const shares = await Promise.all(
      userIds.map(userId =>
        SharedNote.findOrCreate({
          where: {
            noteId,
            sharedWithUserId: userId,
          },
          defaults: {
            noteId,
            sharedByUserId,
            sharedWithUserId: userId,
          },
        })
      )
    );
    return shares.map(([share]) => share);
  }

  /**
   * Unshare a note from a specific user
   */
  async unshare(noteId: number, sharedWithUserId: number): Promise<boolean> {
    const deleted = await SharedNote.destroy({
      where: {
        noteId,
        sharedWithUserId,
      },
    });
    return deleted > 0;
  }

  /**
   * Get all users a note is shared with
   */
  async getSharedWith(noteId: number): Promise<User[]> {
    const shares = await SharedNote.findAll({
      where: { noteId },
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
   * Get all notes shared with a user
   */
  async getNotesSharedWithUser(userId: number): Promise<Note[]> {
    const shares = await SharedNote.findAll({
      where: { sharedWithUserId: userId },
      include: [
        {
          model: Note,
          as: 'note',
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
    return shares.map(share => (share as any).note);
  }

  /**
   * Check if a note is shared with a specific user
   */
  async isSharedWith(noteId: number, userId: number): Promise<boolean> {
    const share = await SharedNote.findOne({
      where: {
        noteId,
        sharedWithUserId: userId,
      },
    });
    return !!share;
  }

  /**
   * Get all shares for a note
   */
  async findByNoteId(noteId: number): Promise<SharedNote[]> {
    return await SharedNote.findAll({
      where: { noteId },
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
   * Remove all shares for a note
   */
  async deleteAllForNote(noteId: number): Promise<number> {
    return await SharedNote.destroy({
      where: { noteId },
    });
  }

  /**
   * Count how many users a note is shared with
   */
  async countShares(noteId: number): Promise<number> {
    return await SharedNote.count({
      where: { noteId },
    });
  }
}

export default new SharedNoteRepository();
