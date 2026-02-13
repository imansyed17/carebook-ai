export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12" id="loading-spinner">
            <div className="relative">
                <div className={`${sizes[size]} border-4 border-surface-200 border-t-primary-600 rounded-full animate-spin`}></div>
                <div className={`absolute inset-0 ${sizes[size]} border-4 border-transparent border-b-primary-300 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            {text && <p className="text-surface-500 text-sm font-medium animate-pulse">{text}</p>}
        </div>
    )
}
