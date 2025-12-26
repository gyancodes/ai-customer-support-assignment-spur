import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import { testConnection, closePool } from './db/pool.js';
import chatRoutes from './routes/chat.routes.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from './middleware/error.middleware.js';

// Validate configuration before starting
validateConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// API Routes
app.use('/chat', chatRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
async function start(): Promise<void> {
  try {
    // Test database connection
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
