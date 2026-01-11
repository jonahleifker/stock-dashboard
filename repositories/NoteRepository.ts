import { Note, User } from '../models';

export interface NoteData {
  ticker: string;
  userId: number;
  bullCase?: string;
  bearCase?: string;
  buyInPrice?: number;
  currentStance?: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Note Repository - handles all note operations
 */
export class NoteRepository {
  /**
   * Find note by ID
   */
  async findById(id: number): Promise<Note | null> {
    return await Note.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
    });
  }

  /**
   * Find all notes for a stock ticker
   */
  async findByTicker(ticker: string): Promise<Note[]> {
    return await Note.findAll({
      where: { ticker },
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find all notes by a user
   */
  async findByUserId(userId: number): Promise<Note[]> {
    return await Note.findAll({
      where: { userId },
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Create a new note
   */
  async create(data: NoteData): Promise<Note> {
    const note = await Note.create(data);
    return await this.findById(note.id) as Note;
  }

  /**
   * Update existing note
   */
  async update(id: number, data: Partial<NoteData>): Promise<Note | null> {
    const note = await Note.findByPk(id);
    if (!note) {
      return null;
    }
    await note.update(data);
    return await this.findById(id);
  }

  /**
   * Delete note
   */
  async delete(id: number): Promise<boolean> {
    const deleted = await Note.destroy({
      where: { id },
    });
    return deleted > 0;
  }

  /**
   * Check if user owns note
   */
  async isOwner(noteId: number, userId: number): Promise<boolean> {
    const note = await Note.findByPk(noteId);
    return note?.userId === userId;
  }

  /**
   * Get all notes (for admin/overview)
   */
  async findAll(): Promise<Note[]> {
    return await Note.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'displayName'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Count notes for a ticker
   */
  async countByTicker(ticker: string): Promise<number> {
    return await Note.count({
      where: { ticker },
    });
  }

  /**
   * Count notes by a user
   */
  async countByUserId(userId: number): Promise<number> {
    return await Note.count({
      where: { userId },
    });
  }
}

export default new NoteRepository();
