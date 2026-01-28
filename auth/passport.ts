import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import models from '../models';
import { Op } from 'sequelize';

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => done(null, user.id));
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  try {
    const user = await models.User.findByPk(id);
    done(null, user);
  } catch (e) {
    done(e, undefined);
  }
});

passport.use(new LocalStrategy({ usernameField: 'username' }, async (username: string, password: string, done: (err: any, user?: any, info?: any) => void) => {
  try {
    console.log('[PASSPORT] Attempting authentication for:', username);
    // Try to find user by username or email
    const user: any = await models.User.findOne({ 
      where: { 
        [Op.or]: [
          { username },
          { email: username }
        ]
      },
      logging: (sql) => console.log('[PASSPORT] SQL Query:', sql)
    });
    console.log('[PASSPORT] Query result:', user ? `User found: ${user.username}` : 'No user found');
    if (!user) {
      console.log('[PASSPORT] User not found:', username);
      return done(null, false);
    }
    if (!user.isActive) {
      console.log('[PASSPORT] User inactive:', username);
      return done(null, false);
    }
    console.log('[PASSPORT] User found, checking password...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log('[PASSPORT] Password mismatch for:', username);
      return done(null, false);
    }
    console.log('[PASSPORT] Authentication successful for:', username);
    user.lastLoginAt = new Date();
    await user.save();
    return done(null, user);
  } catch (e) {
    console.error('[PASSPORT] Error during authentication:', e);
    return done(e);
  }
}));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: (process.env.JWT_SECRET as string) || 'change-me',
}, async (payload: any, done: (err: any, user?: any, info?: any) => void) => {
  try {
    const user: any = await models.User.findByPk(payload.sub);
    if (!user || !user.isActive) return done(null, false);
    return done(null, { id: user.id, roles: payload.roles });
  } catch (e) {
    done(e, false);
  }
}));

export default passport;
