import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import { testConnection, closePool } from './db/pool.js';
import chatRoutes from './routes/chat.routes.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from './middleware/error.middleware.js';

validateConfig();

const app = express();

app.use(cors());

app.use(express.json({ 
  limit: '100kb',
  strict: true,
}));

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid JSON in request body',
      status: 400,
    });
    return;
  }
  if (err.message?.includes('request entity too large')) {
    res.status(413).json({
      error: 'Request body too large. Maximum size is 100KB.',
      status: 413,
    });
    return;
  }
  next(err);
});

app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

app.use('/chat', chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function start(): Promise<void> {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    app.listen(config.server.port, () => {
      console.log(`
Spur Customer Support Chat Backend
----------------------------------------
Port:        ${config.server.port}
Environment: ${config.server.nodeEnv}
LLM Model:   ${config.llm.model}
----------------------------------------
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
