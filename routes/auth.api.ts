import express from 'express';
import passport from '../auth/passport';
import { issueAccessToken, issueRefreshToken, rotateRefreshToken } from '../auth/jwt';
import models from '../models';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, displayName } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const existingUser = await models.User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await models.User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await models.User.create({
      username,
      email: email || null,
      passwordHash,
      displayName: displayName || username,
      isActive: true,
    });

    // Get roles for new user (will be empty unless we assign default role)
    const roles = await (user as any).getRoles().then((rs: any[]) => rs.map(r => r.name));

    // Issue tokens
    const accessToken = issueAccessToken(user, roles);
    const { refreshToken, jti, expiresAt } = await issueRefreshToken(user);

    res.status(201).json({
      accessToken,
      refreshToken,
      jti,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: roles
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', (req, res, next) => {
  console.log('[LOGIN] Attempt:', { username: req.body?.username, hasPassword: !!req.body?.password });
  passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err) {
      console.error('[LOGIN] Authentication error:', err);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user) {
      console.log('[LOGIN] Authentication failed - no user returned. Info:', info);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('[LOGIN] Success for user:', user.username);
    const roles = await user.getRoles().then((rs: any[]) => rs.map(r => r.name));
    const accessToken = issueAccessToken(user, roles);
    const { refreshToken, jti, expiresAt } = await issueRefreshToken(user);
    res.json({ 
      accessToken, 
      refreshToken, 
      jti, 
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: roles
      }
    });
  })(req, res, next);
});

router.post('/refresh', async (req, res) => {
  const { userId, refreshToken } = req.body || {};
  if (!userId || !refreshToken) return res.status(400).json({ error: 'Missing params' });
  const rotated = await rotateRefreshToken(userId, refreshToken);
  if (!rotated) return res.status(401).json({ error: 'Invalid refresh token' });
  const user = await models.User.findByPk(userId);
  if (!user) return res.status(401).json({ error: 'Invalid user' });
  const roles = await (user as any).getRoles().then((rs: any[]) => rs.map(r => r.name));
  const accessToken = issueAccessToken(user, roles);
  res.json({ accessToken, refreshToken: rotated.refreshToken, jti: rotated.jti, expiresAt: rotated.expiresAt });
});

router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  res.json({ user: (req as any).user });
});

router.put('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const user = await models.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { displayName, profilePicture } = req.body;

    // Update fields if provided
    if (displayName !== undefined) user.displayName = displayName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Revoke all active refresh tokens for this user
    await models.RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } }
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;
