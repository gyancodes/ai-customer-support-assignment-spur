import { useState, FormEvent, ChangeEvent } from 'react';

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
    <form className="p-4 sm:px-6 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800" onSubmit={handleSubmit}>
      <div className="flex gap-2 items-end bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-[26px] p-2 pl-5 focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-900/20 focus-within:border-indigo-500/50 transition-all duration-200">
        <textarea
          className="flex-1 bg-transparent border-none focus:outline-none resize-none min-h-[24px] max-h-[120px] py-2.5 text-[15px] text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 disabled:opacity-50 font-medium"
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
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          id="send-message-button"
        >
          <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      {isNearLimit && (
        <div className={`text-xs text-right mt-2 mr-2 font-medium ${characterCount >= maxLength ? 'text-red-500' : 'text-amber-500'}`}>
          {characterCount}/{maxLength}
        </div>
      )}
    </form>
  );
}
