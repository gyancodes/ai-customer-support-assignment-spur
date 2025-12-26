import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool.js';
import { llmService } from './llm.service.js';
import { config } from '../config/index.js';
import { Message, Conversation, LLMMessage, AppError } from '../types/index.js';

class ChatService {
  async processMessage(
    message: string,
    sessionId?: string
  ): Promise<{ reply: string; sessionId: string }> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new AppError(400, 'Message cannot be empty');
    }

    if (trimmedMessage.length > config.chat.maxMessageLength) {
      throw new AppError(
        400,
        `Message is too long. Maximum ${config.chat.maxMessageLength} characters allowed.`
      );
    }

    let conversationId: string;
    if (sessionId) {
      const exists = await this.conversationExists(sessionId);
      if (!exists) {
        throw new AppError(404, 'Conversation not found. Please start a new chat.');
      }
      conversationId = sessionId;
    } else {
      conversationId = await this.createConversation();
    }

    await this.saveMessage(conversationId, 'user', trimmedMessage);

    const history = await this.getConversationHistory(conversationId);

    const llmHistory: LLMMessage[] = history
      .slice(0, -1)
      .map((msg) => ({
        role: msg.sender as 'user' | 'assistant',
        content: msg.text,
      }));

    const reply = await llmService.generateResponse(llmHistory, trimmedMessage);

    await this.saveMessage(conversationId, 'assistant', reply);

    return {
      reply,
      sessionId: conversationId,
    };
  }

  private async createConversation(): Promise<string> {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO conversations (id, created_at) VALUES ($1, NOW())',
      [id]
    );
    return id;
  }

  private async conversationExists(id: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM conversations WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  private async saveMessage(
    conversationId: string,
    sender: 'user' | 'assistant',
    text: string
  ): Promise<Message> {
    const id = uuidv4();
    const result = await pool.query<Message>(
      `INSERT INTO messages (id, conversation_id, sender, text, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, conversationId, sender, text]
    );
    return result.rows[0];
  }

  private async getConversationHistory(
    conversationId: string
  ): Promise<Message[]> {
    const result = await pool.query<Message>(
      `SELECT id, conversation_id, sender, text, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [conversationId, config.chat.maxHistoryMessages]
    );
    return result.rows;
  }

  async getConversation(
    conversationId: string
  ): Promise<{ conversation: Conversation; messages: Message[] } | null> {
    const convResult = await pool.query<Conversation>(
      'SELECT * FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (convResult.rowCount === 0) {
      return null;
    }

    const messagesResult = await pool.query<Message>(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    return {
      conversation: convResult.rows[0],
      messages: messagesResult.rows,
    };
  }
}

export const chatService = new ChatService();
