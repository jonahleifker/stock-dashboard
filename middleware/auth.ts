import { Request, Response, NextFunction } from 'express';
import passport from '../auth/passport';
import models from '../models';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Check for dev bypass token
    const authHeader = req.headers.authorization;
    console.log('Auth Middleware Hit:', { authHeader, env: process.env.NODE_ENV });

    if (process.env.NODE_ENV !== 'production' && authHeader === 'Bearer dev-bypass-token') {
        console.log('Dev bypass token detected');
        // Fetch mock user from DB
        models.User.findByPk(1).then((user: any) => {
            if (user) {
                console.log('Dev user found:', user.username);
                (req as any).user = user;
                // Mock roles if needed
                (req as any).user.roles = ['admin']; // Ensure admin role for access
                return next(); // Return here to ensure we don't fall through
            } else {
                console.error("User 1 not found for dev bypass");
                return res.status(401).json({ error: 'Dev user not found' });
            }
        }).catch((err: any) => {
            console.error("Error fetching dev user", err);
            return next(err);
        });
        return; // Ensure we don't proceed to passport
    }

    // Default to JWT auth
    console.log('Falling back to Passport JWT');
    passport.authenticate('jwt', { session: false })(req, res, next);
};
