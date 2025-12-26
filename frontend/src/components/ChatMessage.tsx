import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}


export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-4 w-full max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''} animate-message-in`}>
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm mt-1
        ${isUser 
          ? 'bg-indigo-500 text-white' 
          : 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-zinc-700'
        }
      `}>
        {isUser ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5z"/>
          </svg>
        )}
      </div>
      
      <div className={`
        flex flex-col gap-1 min-w-0
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-500">
          {isUser ? 'You' : 'Spur Support'}
        </span>
        
        <div className={`
          px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap max-w-full
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-tr-sm' 
            : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-100 dark:border-zinc-700 rounded-tl-sm'
          }
        `}>
          {message.text}
        </div>
        
        <span className="text-[11px] text-slate-400 dark:text-zinc-600">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
