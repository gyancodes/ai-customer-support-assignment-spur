import { pool, closePool } from './pool.js';

/**
 * Database migration script
 * Creates the required tables for the chat application
 */
async function migrate(): Promise<void> {
  console.log('🔄 Running database migrations...');

  try {
    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✅ conversations table ready');

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
        text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✅ messages table ready');

    // Create index for faster message retrieval by conversation
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
      ON messages(conversation_id);
    `);
    console.log('  ✅ indexes created');

    // Create index for ordering messages by time
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(conversation_id, created_at);
    `);

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run migrations if this file is executed directly
migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
