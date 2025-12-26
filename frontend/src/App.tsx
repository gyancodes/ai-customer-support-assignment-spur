import { ChatWindow } from './components/ChatWindow';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

/**
 * Root application component
 */
function App() {
  return (
    <ThemeProvider>
      <div className="app bg-slate-100 dark:bg-zinc-950 min-h-screen flex items-center justify-center p-4 transition-colors duration-200">
        <ChatWindow />
      </div>
    </ThemeProvider>
  );
}

export default App;
