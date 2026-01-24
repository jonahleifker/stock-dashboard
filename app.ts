import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import cors from 'cors';
import passport from './auth/passport';
import sequelize from './db/sequelize';
import { initializeDatabase } from './db/init';
import indexRouter from './routes/index';
import authWeb from './routes/auth.web';
import authApi from './routes/auth.api';
import stockRoutes from './routes/stocks';
import noteRoutes from './routes/notes';
import fileRoutes from './routes/files';
import articleRoutes from './routes/articles';
import researchRoutes from './routes/research';
import earningsRoutes from './routes/earnings';
import favoritesRouter from './routes/favorites';
import watchlistRouter from './routes/watchlist';

// Initialize database
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve React client build files statically from dist/client
app.use(express.static(path.join(__dirname, 'dist', 'client')));

// Sessions (web) with Sequelize store
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const store = new SequelizeStore({ db: sequelize });
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  app.set('trust proxy', 1);
}
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  store,
  cookie: { httpOnly: true, sameSite: 'lax', secure: isProduction },
}));
store.sync();

app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

// DEV: Bypass Authentication Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Inject default user for all requests
  (req as any).user = {
    id: 1,
    username: 'jonah',
    email: 'jonahleifker@gmail.com',
    displayName: 'Jonah Leifker',
    roles: ['admin'] // Simulate admin role
  };
  next();
});

// API routes
app.use('/api', indexRouter);
app.use('/auth', authWeb); // session-based web auth
app.use('/api/auth', authApi); // JWT-based API auth
app.use('/api/stocks', stockRoutes); // stock data API
app.use('/api/notes', noteRoutes); // notes API
app.use('/api/files', fileRoutes); // file upload/download API
app.use('/api/articles', articleRoutes); // articles/links API
app.use('/api/research', researchRoutes); // Manus AI research API
app.use('/api/earnings', earningsRoutes); // Earnings reports API
app.use('/api/favorites', favoritesRouter); // Favorites API
app.use('/api/watchlist', watchlistRouter); // Watchlist API

// Catch-all handler to serve React app for client-side routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'));
});

// 404 handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

export default app;
