import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full overflow-auto">
                        <h2 className="text-xl font-semibold mb-2">Error:</h2>
                        <pre className="text-red-300 font-mono bg-gray-900 p-4 rounded mb-4 overflow-x-auto">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <h2 className="text-xl font-semibold mb-2">Stack Trace:</h2>
                        <details className="text-gray-400 cursor-pointer">
                            <summary>Click to view</summary>
                            <pre className="text-xs font-mono mt-2 overflow-x-auto">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
