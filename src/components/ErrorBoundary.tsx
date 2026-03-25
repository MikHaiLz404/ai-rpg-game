'use client';

import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.componentName || 'Component'} error:`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur rounded-xl border border-rose-500/30 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-1">
            {this.props.componentName ? `${this.props.componentName} Error` : 'Component Error'}
          </h3>
          <p className="text-xs text-slate-400 mb-4 max-w-xs">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper components for specific game areas
export function GameOverlayErrorBoundary({ children, componentName }: { children: ReactNode; componentName: string }) {
  return (
    <ErrorBoundary
      componentName={componentName}
      fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[200]">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 backdrop-blur rounded-xl border border-rose-500/30 text-center max-w-sm">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-1">
              {componentName} Error
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              This overlay encountered an error. Try refreshing the page.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function PhaserErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      componentName="Game Engine"
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-800/80 backdrop-blur rounded-xl border border-rose-500/30 text-center">
            <div className="text-4xl mb-2">🎮</div>
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-1">
              Game Engine Error
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              The game engine failed to load. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
