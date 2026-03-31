import { useState } from 'react'
import { useAssistant } from '../../context/AssistantContext'

export default function ChatInput() {
  const [input, setInput] = useState('')
  const { handleUserMessage, isLoading, workflowStatus, currentIntent } = useAssistant()

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    handleUserMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Context-aware suggestions
  const getSuggestions = () => {
    if (workflowStatus === 'complete') {
      return [
        "Book another appointment",
        "Check my appointments",
        "Find a provider",
      ]
    }
    if (currentIntent === null) {
      return [
        "Find a PCP",
        "Book earliest appointment",
        "Reschedule my appointment",
        "Cancel my appointment",
        "Check my appointments",
      ]
    }
    return []
  }

  const suggestions = getSuggestions()

  return (
    <div className="border-t border-surface-100 bg-white px-4 py-3">
      {/* Quick suggestions (show when no active flow) */}
      {suggestions.length > 0 && !input && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setInput('')
                handleUserMessage(suggestion)
              }}
              className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full border border-primary-200 hover:bg-primary-100 transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Processing...' : 'Type your request...'}
            className="w-full resize-none rounded-xl border-2 border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
            rows={1}
            disabled={isLoading}
            id="assistant-chat-input"
            aria-label="Chat with assistant"
            autoFocus
            style={{ minHeight: '42px', maxHeight: '100px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-primary-700 text-white hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          id="assistant-send-btn"
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}
