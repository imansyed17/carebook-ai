export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in" id="error-message">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-surface-800 mb-1">Something went wrong</h3>
                <p className="text-surface-500 text-sm max-w-md">{message || 'An unexpected error occurred. Please try again.'}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn-secondary text-sm"
                    id="error-retry-btn"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                        </svg>
                        Try Again
                    </span>
                </button>
            )}
        </div>
    )
}
