export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

export interface ApiError {
  error: string;
  status: number;
}

export interface ApiMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  text: string;
  created_at: string;
}

export interface ConversationHistoryResponse {
  conversation: {
    id: string;
    created_at: string;
  };
  messages: ApiMessage[];
}
