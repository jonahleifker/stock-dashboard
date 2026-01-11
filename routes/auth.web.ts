import express from 'express';
import passport from '../auth/passport';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  const user = (req as any).user;
  res.json({ id: user.id, email: user.email });
});

router.post('/logout', (req, res, next) => {
  (req as any).logout((err: any) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!(req as any).isAuthenticated || !(req as any).isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = (req as any).user;
  res.json({ id: user.id, email: user.email });
});

export default router;
