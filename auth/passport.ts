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
    // Try to find user by username or email
    const user: any = await models.User.findOne({ 
      where: { 
        [Op.or]: [
          { username },
          { email: username }
        ]
      } 
    });
    if (!user || !user.isActive) return done(null, false);
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return done(null, false);
    user.lastLoginAt = new Date();
    await user.save();
    return done(null, user);
  } catch (e) {
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
