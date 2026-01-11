import { Request, Response } from 'express';
import noteService from '../services/noteService';

/**
 * Note Controller - Handles HTTP requests for note operations
 */
class NoteController {
  /**
   * GET /api/notes/:ticker
   * Get all notes for a specific stock ticker
   */
  async getNotesByTicker(req: Request, res: Response) {
    try {
      const ticker = req.params.ticker as string;
      
      if (!ticker) {
        return res.status(400).json({ error: 'Ticker is required' });
      }

      const notes = await noteService.getNotesByTicker(ticker);
      
      // Transform notes to include user info
      const notesWithUser = notes.map((note: any) => ({
        id: note.id,
        ticker: note.ticker,
        bullCase: note.bullCase,
        bearCase: note.bearCase,
        buyInPrice: note.buyInPrice,
        currentStance: note.currentStance,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        user: note.User ? {
          id: note.User.id,
          username: note.User.username,
          displayName: note.User.displayName || note.User.username,
        } : null,
      }));

      res.json({ 
        ticker,
        count: notes.length,
        notes: notesWithUser 
      });
    } catch (error) {
      console.error('Error fetching notes by ticker:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  /**
   * POST /api/notes/:ticker
   * Create a new note for a stock
   * Requires authentication
   */
  async createNote(req: Request, res: Response) {
    try {
      const ticker = req.params.ticker as string;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!ticker) {
        return res.status(400).json({ error: 'Ticker is required' });
      }

      const { bullCase, bearCase, buyInPrice, currentStance } = req.body;

      // Validate at least one field is provided
      if (!bullCase && !bearCase && !buyInPrice && !currentStance) {
        return res.status(400).json({ 
          error: 'At least one of bullCase, bearCase, buyInPrice, or currentStance is required' 
        });
      }

      // Validate currentStance if provided
      if (currentStance && !['bullish', 'bearish', 'neutral'].includes(currentStance)) {
        return res.status(400).json({ 
          error: 'currentStance must be one of: bullish, bearish, neutral' 
        });
      }

      const note = await noteService.createNote(ticker, userId, {
        bullCase,
        bearCase,
        buyInPrice,
        currentStance,
      });

      res.status(201).json({ 
        message: 'Note created successfully',
        note: {
          id: note.id,
          ticker: note.ticker,
          bullCase: note.bullCase,
          bearCase: note.bearCase,
          buyInPrice: note.buyInPrice,
          currentStance: note.currentStance,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }
      });
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  }

  /**
   * PUT /api/notes/:id
   * Update an existing note
   * Only note owner can edit
   */
  async updateNote(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const noteId = parseInt(id, 10);
      if (isNaN(noteId)) {
        return res.status(400).json({ error: 'Invalid note ID' });
      }

      const { bullCase, bearCase, buyInPrice, currentStance } = req.body;

      // Validate currentStance if provided
      if (currentStance && !['bullish', 'bearish', 'neutral'].includes(currentStance)) {
        return res.status(400).json({ 
          error: 'currentStance must be one of: bullish, bearish, neutral' 
        });
      }

      const note = await noteService.updateNote(noteId, userId, {
        bullCase,
        bearCase,
        buyInPrice,
        currentStance,
      });

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json({ 
        message: 'Note updated successfully',
        note: {
          id: note.id,
          ticker: note.ticker,
          bullCase: note.bullCase,
          bearCase: note.bearCase,
          buyInPrice: note.buyInPrice,
          currentStance: note.currentStance,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }
      });
    } catch (error: any) {
      if (error.message?.includes('Unauthorized')) {
        return res.status(403).json({ error: 'You do not have permission to edit this note' });
      }
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note' });
    }
  }

  /**
   * DELETE /api/notes/:id
   * Delete a note
   * Only note owner can delete
   */
  async deleteNote(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const noteId = parseInt(id, 10);
      if (isNaN(noteId)) {
        return res.status(400).json({ error: 'Invalid note ID' });
      }

      const deleted = await noteService.deleteNote(noteId, userId);

      if (!deleted) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json({ message: 'Note deleted successfully' });
    } catch (error: any) {
      if (error.message?.includes('Unauthorized')) {
        return res.status(403).json({ error: 'You do not have permission to delete this note' });
      }
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  }

  /**
   * GET /api/notes/user/:userId
   * Get all notes by a specific user
   */
  async getNotesByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      
      const userIdNum = parseInt(userId, 10);
      if (isNaN(userIdNum)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const notes = await noteService.getNotesByUser(userIdNum);
      
      // Transform notes to include user info
      const notesWithUser = notes.map((note: any) => ({
        id: note.id,
        ticker: note.ticker,
        bullCase: note.bullCase,
        bearCase: note.bearCase,
        buyInPrice: note.buyInPrice,
        currentStance: note.currentStance,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        user: note.User ? {
          id: note.User.id,
          username: note.User.username,
          displayName: note.User.displayName || note.User.username,
        } : null,
      }));

      res.json({ 
        userId: userIdNum,
        count: notes.length,
        notes: notesWithUser 
      });
    } catch (error) {
      console.error('Error fetching notes by user:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }
}

export default new NoteController();
