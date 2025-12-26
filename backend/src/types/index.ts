export interface Conversation {
  id: string;
  created_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  text: string;
  created_at: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMServiceConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
