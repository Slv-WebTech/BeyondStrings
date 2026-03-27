import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component - Catches and displays React errors gracefully
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const errorCount = (this.state.errorCount || 0) + 1;

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught:', error);
            console.error('Error Info:', errorInfo);
        }

        // Set state
        this.setState({
            error,
            errorInfo,
            errorCount
        });

        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            try {
                const errorReport = {
                    message: error?.message,
                    stack: error?.stack,
                    componentStack: errorInfo?.componentStack,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                };
                // Send to analytics/logging service
                console.warn('Production error logged:', errorReport);
            } catch (e) {
                // Silently fail if logging fails
            }
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = process.env.NODE_ENV === 'development';

            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
                    <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                                <AlertCircle size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
                        </div>

                        <p className="mb-4 text-sm text-slate-300">
                            Sorry, we encountered an unexpected error. Your changes may not be saved.
                        </p>

                        {isDevelopment && this.state.error && (
                            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-950/30 p-3">
                                <p className="mb-2 text-xs font-mono font-semibold text-red-400">Error Details:</p>
                                <p className="mb-2 break-words text-xs text-red-300">{this.state.error.toString()}</p>
                                {this.state.errorInfo?.componentStack && (
                                    <>
                                        <p className="mb-1 text-xs font-semibold text-red-400">Component Stack:</p>
                                        <pre className="overflow-x-auto text-[10px] text-red-300">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-100 transition hover:bg-slate-600 active:scale-95"
                            >
                                <RefreshCw size={16} />
                                <span>Try again</span>
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-700/50 active:scale-95"
                            >
                                <span>Reload page</span>
                            </button>
                        </div>

                        {this.state.errorCount > 3 && (
                            <p className="mt-4 text-xs text-amber-400">
                                Note: Multiple errors detected. Fresh reload may help. Please check console for details.
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
