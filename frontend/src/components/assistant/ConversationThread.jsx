import { useEffect, useRef } from 'react'
import { useAssistant } from '../../context/AssistantContext'
import RecommendationCard from './RecommendationCard'
import AppointmentOptionList from './AppointmentOptionList'
import BookingReviewModal from './BookingReviewModal'
import ConfirmationPreferences from './ConfirmationPreferences'

export default function ConversationThread({ messages, isLoading }) {
    const scrollRef = useRef(null)

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 assistant-scroll"
            id="conversation-thread"
            aria-live="polite"
            aria-atomic="false"
        >
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                    </div>
                    <div className="bg-surface-50 rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function MessageBubble({ message }) {
    const isUser = message.role === 'user'

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[85%] bg-primary-700 text-white rounded-2xl rounded-tr-md px-4 py-3">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
            </div>
        )
    }

    // Assistant messages — different types
    return (
        <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
            </div>
            <div className="max-w-[90%] flex-1">
                <MessageContent message={message} />
            </div>
        </div>
    )
}

function MessageContent({ message }) {
    switch (message.type) {
        case 'text':
            return (
                <div className="bg-surface-50 rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-sm text-surface-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }} />
                </div>
            )

        case 'clarification':
            return <ClarificationBubble content={message.content} />

        case 'recommendations':
            return <RecommendationCard recommendations={message.content} />

        case 'slots':
            return <SlotPicker content={message.content} />

        case 'booking_review':
            return <BookingReviewModal content={message.content} />

        case 'confirmation':
            return <ConfirmationPreferences content={message.content} />

        case 'appointment_list':
            return <AppointmentOptionList content={message.content} />

        case 'error':
            return (
                <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-sm text-red-700 leading-relaxed">{message.content}</p>
                </div>
            )

        default:
            return (
                <div className="bg-surface-50 rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-sm text-surface-700 leading-relaxed">{String(message.content)}</p>
                </div>
            )
    }
}

function ClarificationBubble({ content }) {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-md px-4 py-3">
            <p className="text-sm text-amber-800 leading-relaxed">{content.question}</p>
        </div>
    )
}

function SlotPicker({ content }) {
    const { selectSlot } = useAssistant()
    const { provider, slots } = content
    const dates = Object.keys(slots).sort().slice(0, 5)

    if (dates.length === 0) {
        return (
            <div className="bg-surface-50 rounded-2xl rounded-tl-md px-4 py-3">
                <p className="text-sm text-surface-500">No available slots for this provider right now.</p>
            </div>
        )
    }

    return (
        <div className="bg-surface-50 rounded-2xl rounded-tl-md p-4 space-y-3">
            {dates.map(date => (
                <div key={date}>
                    <p className="text-xs font-semibold text-surface-500 uppercase mb-2">
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {slots[date].slice(0, 6).map(time => {
                            const [hours, minutes] = time.split(':')
                            const h = parseInt(hours)
                            const ampm = h >= 12 ? 'PM' : 'AM'
                            const hour12 = h % 12 || 12
                            return (
                                <button
                                    key={`${date}-${time}`}
                                    onClick={() => selectSlot(date, time, provider)}
                                    className="px-3 py-1.5 text-xs font-medium bg-white border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 hover:border-primary-400 transition-colors"
                                >
                                    {hour12}:{minutes} {ampm}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Simple markdown formatter for bold text that also escapes HTML to prevent XSS
function formatMarkdown(text) {
    if (!text) return ''
    
    // First, escape HTML characters
    const escaped = text.replace(/[<>"'&]/g, (char) => {
        const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
        return map[char];
    });
    
    // Then apply the bold formatting
    return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}
