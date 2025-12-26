import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types';
import { sendMessage as sendMessageApi, ChatApiError } from '../services/api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import './ChatWindow.css';

/**
 * Main chat window component
 * Manages chat state, handles message sending, and renders the chat UI
 */
export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! 👋 I'm your ShopEase support assistant. I can help you with orders, shipping, returns, and more. How can I help you today?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (text: string) => {
    // Clear any previous errors
    setError(null);

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to API
      const response = await sendMessageApi({
        message: text,
        sessionId: sessionId || undefined,
      });

      // Update session ID
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      // Add AI response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err instanceof ChatApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleNewChat = () => {
    setMessages([{
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! 👋 I'm your ShopEase support assistant. I can help you with orders, shipping, returns, and more. How can I help you today?",
      timestamp: new Date(),
    }]);
    setSessionId(null);
    setError(null);
  };

  return (
    <div className="chat-window">
      <header className="chat-window__header">
        <div className="chat-window__header-content">
          <div className="chat-window__logo">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5z"/>
            </svg>
          </div>
          <div className="chat-window__header-text">
            <h1 className="chat-window__title">ShopEase Support</h1>
            <span className="chat-window__status">
              <span className="chat-window__status-dot"></span>
              Online
            </span>
          </div>
        </div>
        <button 
          className="chat-window__new-chat"
          onClick={handleNewChat}
          aria-label="Start new chat"
          id="new-chat-button"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          New Chat
        </button>
      </header>

      <div className="chat-window__messages" ref={chatContainerRef}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-window__error" role="alert">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
          <button 
            onClick={handleDismissError}
            className="chat-window__error-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
