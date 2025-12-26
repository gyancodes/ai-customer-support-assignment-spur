import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types';
import { sendMessage as sendMessageApi, getConversationHistory, ChatApiError } from '../services/api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { useTheme } from '../context/ThemeContext';

const SESSION_STORAGE_KEY = 'spur_chat_session_id';

/**
 * Get the welcome message
 */
function getWelcomeMessage(): Message {
  return {
    id: 'welcome',
    sender: 'assistant',
    text: "Hi! 👋 I'm your Spur support assistant. I can help you with orders, shipping, returns, and more. How can I help you today?",
    timestamp: new Date(),
  };
}

/**
 * Main chat window component
 * Manages chat state, handles message sending, and renders the chat UI
 */
export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Load session from localStorage and fetch history on mount
  useEffect(() => {
    async function loadConversationHistory() {
      const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      
      if (savedSessionId) {
        try {
          const history = await getConversationHistory(savedSessionId);
          
          if (history.length > 0) {
            // Session exists and has messages
            setSessionId(savedSessionId);
            setMessages(history);
          } else {
            // Session not found or empty, clear and show welcome
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setMessages([getWelcomeMessage()]);
          }
        } catch (err) {
          console.error('Failed to load conversation history:', err);
          localStorage.removeItem(SESSION_STORAGE_KEY);
          setMessages([getWelcomeMessage()]);
        }
      } else {
        // No saved session, show welcome message
        setMessages([getWelcomeMessage()]);
      }
      
      setIsLoadingHistory(false);
    }
    
    loadConversationHistory();
  }, []);

  // Save sessionId to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  }, [sessionId]);

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
    // Clear localStorage
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Reset state
    setMessages([getWelcomeMessage()]);
    setSessionId(null);
    setError(null);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl h-[calc(100vh-32px)] max-h-[900px] bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">Spur Support</h1>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
            onClick={handleNewChat}
            aria-label="Start new chat"
            id="new-chat-button"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 flex flex-col gap-6 bg-slate-50 dark:bg-[#09090b] scroll-smooth" ref={chatContainerRef}>
        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
              <span className="text-sm text-slate-500 dark:text-zinc-500">Loading conversation...</span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="flex items-center gap-3 px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm animate-fade-in" role="alert">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="flex-1">{error}</span>
          <button 
            onClick={handleDismissError}
            className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
