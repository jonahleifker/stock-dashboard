#!/usr/bin/env node

/**
 * Module dependencies.
 */

import 'dotenv/config';
import debugModule from 'debug';
import http from 'http';
import { initializeDatabase } from '../db/init';

const debug = debugModule('${PROJECT_NAME}:server');

/**
 * Initialize database before starting server
 */
async function startServer() {
  try {
    // Wait for database to initialize
    await initializeDatabase();
    console.log('✅ Database ready');

    // Now import app (which depends on database being ready)
    const { default: app } = await import('../app');

    /**
     * Get port from environment and store in Express.
     */
    const port = normalizePort(process.env.PORT || '6405');
    app.set('port', port);

    /**
     * Create HTTP server.
     */
    const server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    function onListening(): void {
      const addr = server.address();
      if (typeof addr === 'string') {
        console.log(`server started:  http://localhost:${addr}`);
      } else {
        console.log(`server started:  http://localhost:${addr?.port}`);
      }
    }

    function onError(error: NodeJS.ErrnoException): void {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

// Start the server
startServer();
