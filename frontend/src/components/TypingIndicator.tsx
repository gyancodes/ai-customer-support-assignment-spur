
export function TypingIndicator() {
  return (
    <div className="flex gap-4 w-full animate-message-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm mt-1">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5z"/>
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-500">Spur Support is typing</span>
        <div className="flex gap-1.5 px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl rounded-tl-sm w-fit shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}
