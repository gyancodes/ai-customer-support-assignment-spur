import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration loaded from environment variables
 * All sensitive values come from .env file
 */
export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'ai_chat',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  llm: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '500', 10),
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  },
  chat: {
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '2000', 10),
    maxHistoryMessages: parseInt(process.env.MAX_HISTORY_MESSAGES || '10', 10),
  },
} as const;

/**
 * Validate that required environment variables are set
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.llm.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  if (!config.database.password && config.server.nodeEnv === 'production') {
    errors.push('DB_PASSWORD is required in production');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}
