import NoteRepository, { NoteData } from '../repositories/NoteRepository';
import { Note } from '../models';

/**
 * Note Service - Business logic for note operations
 */
class NoteService {
  private repository = NoteRepository;

  /**
   * Get all notes for a stock ticker
   */
  async getNotesByTicker(ticker: string): Promise<Note[]> {
    return await this.repository.findByTicker(ticker.toUpperCase());
  }

  /**
   * Get all notes by a specific user
   */
  async getNotesByUser(userId: number): Promise<Note[]> {
    return await this.repository.findByUserId(userId);
  }

  /**
   * Get a single note by ID
   */
  async getNoteById(id: number): Promise<Note | null> {
    return await this.repository.findById(id);
  }

  /**
   * Create a new note for a stock
   */
  async createNote(
    ticker: string, 
    userId: number, 
    data: {
      bullCase?: string;
      bearCase?: string;
      buyInPrice?: number;
      currentStance?: 'bullish' | 'bearish' | 'neutral';
    }
  ): Promise<Note> {
    const noteData: NoteData = {
      ticker: ticker.toUpperCase(),
      userId,
      bullCase: data.bullCase,
      bearCase: data.bearCase,
      buyInPrice: data.buyInPrice,
      currentStance: data.currentStance,
    };

    return await this.repository.create(noteData);
  }

  /**
   * Update an existing note
   * Returns null if note doesn't exist
   */
  async updateNote(
    id: number, 
    userId: number, 
    data: {
      bullCase?: string;
      bearCase?: string;
      buyInPrice?: number;
      currentStance?: 'bullish' | 'bearish' | 'neutral';
    }
  ): Promise<Note | null> {
    // Check ownership
    const isOwner = await this.repository.isOwner(id, userId);
    if (!isOwner) {
      throw new Error('Unauthorized: User does not own this note');
    }

    return await this.repository.update(id, data);
  }

  /**
   * Delete a note
   * Returns false if note doesn't exist or user is not owner
   */
  async deleteNote(id: number, userId: number): Promise<boolean> {
    // Check ownership
    const isOwner = await this.repository.isOwner(id, userId);
    if (!isOwner) {
      throw new Error('Unauthorized: User does not own this note');
    }

    return await this.repository.delete(id);
  }

  /**
   * Check if a user owns a note
   */
  async checkOwnership(noteId: number, userId: number): Promise<boolean> {
    return await this.repository.isOwner(noteId, userId);
  }

  /**
   * Get count of notes for a ticker
   */
  async countNotesByTicker(ticker: string): Promise<number> {
    return await this.repository.countByTicker(ticker.toUpperCase());
  }

  /**
   * Get count of notes by a user
   */
  async countNotesByUser(userId: number): Promise<number> {
    return await this.repository.countByUserId(userId);
  }
}

export default new NoteService();
