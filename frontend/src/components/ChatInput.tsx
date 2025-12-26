import { useState, FormEvent, ChangeEvent } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  maxLength?: number;
}

/**
 * Chat input component
 * Text input with send button and Enter key support
 */
export function ChatInput({ onSend, disabled, maxLength = 2000 }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount >= maxLength * 0.9;

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <div className="chat-input__container">
        <textarea
          className="chat-input__textarea"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Waiting for response...' : 'Type your message...'}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
          id="chat-input-field"
        />
        <button
          type="submit"
          className="chat-input__button"
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          id="send-message-button"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      {isNearLimit && (
        <div className="chat-input__counter">
          {characterCount}/{maxLength}
        </div>
      )}
    </form>
  );
}
