import express from 'express';
import passport from '../auth/passport';
import { User } from '../models';

const router = express.Router();

// Middleware to require authentication
const requireAuth = passport.authenticate('jwt', { session: false });

/**
 * GET /api/users
 * Get all users (for sharing functionality)
 * Requires authentication
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const currentUserId = (req.user as any)?.id;

    // Get all users except the current user
    const users = await User.findAll({
      where: {
        isActive: true,
      },
      attributes: ['id', 'username', 'displayName', 'email'],
      order: [['username', 'ASC']],
    });

    // Filter out current user
    const filteredUsers = users
      .filter(user => user.id !== currentUserId)
      .map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        email: user.email,
      }));

    res.json({
      count: filteredUsers.length,
      users: filteredUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
