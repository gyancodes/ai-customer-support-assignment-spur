import { SendMessageRequest, SendMessageResponse, ApiError } from '../types';

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
