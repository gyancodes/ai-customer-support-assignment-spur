import { SendMessageRequest, SendMessageResponse, ApiError, ConversationHistoryResponse, Message } from '../types';

// Use environment variable for production, fallback to relative path for dev proxy
const API_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = `${API_BASE}/chat`;
const HEALTH_URL = `${API_BASE}/health`;

export class ChatApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

export async function sendMessage(
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new ChatApiError(
        error.status || response.status,
        error.error || 'An unexpected error occurred'
      );
    }

    return data as SendMessageResponse;
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ChatApiError(
        0,
        'Unable to connect to the server. Please check your connection.'
      );
    }

    throw new ChatApiError(500, 'An unexpected error occurred. Please try again.');
  }
}

export async function getConversationHistory(
  sessionId: string
): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const data = await response.json();
      const error = data as ApiError;
      throw new ChatApiError(
        error.status || response.status,
        error.error || 'Failed to load conversation history'
      );
    }

    const data = await response.json() as ConversationHistoryResponse;
    
    return data.messages.map((msg) => ({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: new Date(msg.created_at),
    }));
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }

    console.error('Failed to load conversation history:', error);
    return [];
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL);
    return response.ok;
  } catch {
    return false;
  }
}
