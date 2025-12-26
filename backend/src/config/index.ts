import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  llm: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '500', 10),
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  },
  chat: {
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '2000', 10),
    maxHistoryMessages: parseInt(process.env.MAX_HISTORY_MESSAGES || '10', 10),
  },
} as const;

export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.llm.apiKey) {
    errors.push('GROQ_API_KEY is required');
  }

  if (!config.database.url) {
    errors.push('DATABASE_URL is required (Neon DB connection string)');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}
