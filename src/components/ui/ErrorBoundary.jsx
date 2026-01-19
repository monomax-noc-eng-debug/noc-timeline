import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 text-center min-h-[400px]">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2 tracking-tighter">
            System Malfunction
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
            The application encountered a critical error. Protocol requires a system restart.
          </p>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-8 max-w-lg w-full overflow-hidden">
            <code className="text-[10px] text-red-500 font-mono break-all">
              {this.state.error?.toString()}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-mediumst hover:scale-105 transition-transform"
          >
            <RefreshCcw size={16} />
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;