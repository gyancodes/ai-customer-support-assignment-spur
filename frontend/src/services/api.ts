import { SendMessageRequest, SendMessageResponse, ApiError, ConversationHistoryResponse, Message } from '../types';

const API_BASE_URL = '/chat';

/**
 * Custom error class for API errors
 */
export class ChatApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

/**
 * Send a message to the chat API
 * @param request - The message and optional session ID
 * @returns The AI response and session ID
 * @throws ChatApiError if the request fails
 */
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

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ChatApiError(
        0,
        'Unable to connect to the server. Please check your connection.'
      );
    }

    throw new ChatApiError(500, 'An unexpected error occurred. Please try again.');
  }
}

/**
 * Get conversation history by session ID
 * @param sessionId - The conversation/session ID
 * @returns Array of messages in the conversation
 * @throws ChatApiError if the request fails
 */
export async function getConversationHistory(
  sessionId: string
): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        // Conversation not found, return empty array
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
    
    // Convert API messages to frontend Message format
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

    // Handle network errors silently for history loading
    console.error('Failed to load conversation history:', error);
    return [];
  }
}

/**
 * Check if the API is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('/health');
    return response.ok;
  } catch {
    return false;
  }
}
