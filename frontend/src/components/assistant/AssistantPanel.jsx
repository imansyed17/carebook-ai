import { useState, useRef, useEffect } from 'react'
import { useAssistant } from '../../context/AssistantContext'
import ConversationThread from './ConversationThread'
import ChatInput from './ChatInput'
import { AssistantErrorBoundary } from './AssistantErrorBoundary'

export default function AssistantPanel() {
    const { isPanelOpen, closePanel, messages, isLoading, resetWorkflow, workflowStatus } = useAssistant()
    const panelRef = useRef(null)

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isPanelOpen) closePanel()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPanelOpen, closePanel])

    if (!isPanelOpen) return null

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                onClick={closePanel}
            />

            {/* Panel */}
            <aside
                ref={panelRef}
                className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] lg:w-[400px] bg-white border-l border-surface-200 shadow-2xl flex flex-col animate-slide-in-right"
                id="assistant-panel"
                role="complementary"
                aria-label="CareBook AI Assistant"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 bg-gradient-to-r from-primary-700 to-teal-600">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-white font-display font-bold text-sm">CareBook AI Assistant</h2>
                            <p className="text-white/60 text-xs">Powered by smart scheduling</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {workflowStatus !== 'idle' && (
                            <button
                                onClick={resetWorkflow}
                                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                title="Start over"
                                id="assistant-reset-btn"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={closePanel}
                            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            id="assistant-close-btn"
                            aria-label="Close assistant"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Conversation & Input wrapped in Error Boundary */}
                <AssistantErrorBoundary>
                    <ConversationThread messages={messages} isLoading={isLoading} />
                    <ChatInput />
                </AssistantErrorBoundary>
            </aside>
        </>
    )
}
