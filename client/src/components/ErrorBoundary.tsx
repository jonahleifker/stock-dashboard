import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Error fallback UI component
function ErrorFallback({ error, errorInfo, onRetry, onGoHome }: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onGoHome: () => void;
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleGoHome = () => {
    onGoHome();
    // Use window.location for reliable navigation in error boundary context
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Error Icon */}
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              We're sorry, but something unexpected happened. Please try again or return to the home page.
            </p>
          </div>

          {/* Development Error Details */}
          {isDevelopment && error && (
            <div className="w-full mt-4 p-4 bg-muted rounded-md text-left">
              <h2 className="text-sm font-semibold text-destructive mb-2">
                Error Details (Development Mode)
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Error:</span>
                  <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
                    {error.toString()}
                  </pre>
                </div>
                {errorInfo && (
                  <div>
                    <span className="font-medium text-muted-foreground">Stack Trace:</span>
                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto max-h-48">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
            <Button
              onClick={onRetry}
              variant="default"
              className="w-full sm:w-auto"
            >
              Retry
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Here you could also log the error to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    // Reset error state to allow retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    // Reset error state and navigate will be handled by the fallback component
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
