import { pool, closePool } from './pool.js';

async function migrate(): Promise<void> {
  console.log('Running database migrations...');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  conversations table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
        text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  messages table ready');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
      ON messages(conversation_id);
    `);
    console.log('  indexes created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(conversation_id, created_at);
    `);

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
