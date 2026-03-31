import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { detectIntent, extractConstraints, getMissingFields, getClarificationQuestion } from '../services/assistantNLU'
import * as assistantService from '../services/assistantService'

const AssistantContext = createContext(null)

// ─── Initial State ──────────────────────────────────────────────────────────────

const initialState = {
    isPanelOpen: false,
    messages: [
        {
            id: 'welcome',
            role: 'assistant',
            type: 'text',
            content: "Hi! I'm your CareBook AI assistant. I can help you find providers, book appointments, reschedule, or cancel. How can I help you today?",
            timestamp: new Date().toISOString()
        }
    ],
    currentIntent: null,
    extractedConstraints: {},
    missingFields: [],
    recommendedOptions: [],
    selectedOption: null,
    selectedSlot: null,
    workflowStatus: 'idle',
    appointmentResults: [],
    bookingData: null,
    confirmationResult: null,
    isLoading: false,
}

function initAssistantState() {
    try {
        const saved = sessionStorage.getItem('carebook_assistant_state')
        if (saved) {
            const parsed = JSON.parse(saved)
            return {
                ...initialState,
                ...parsed,
                isLoading: false // Never restore a loading state
            }
        }
    } catch(e) {
        console.warn('Failed to restore assistant state:', e)
    }
    return initialState
}

// ─── Reducer ────────────────────────────────────────────────────────────────────

function assistantReducer(state, action) {
    switch (action.type) {
        case 'TOGGLE_PANEL':
            return { ...state, isPanelOpen: !state.isPanelOpen }
        case 'OPEN_PANEL':
            return { ...state, isPanelOpen: true }
        case 'CLOSE_PANEL':
            return { ...state, isPanelOpen: false }
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, { ...action.payload, id: Date.now().toString(), timestamp: new Date().toISOString() }] }
        case 'SET_INTENT':
            return { ...state, currentIntent: action.payload }
        case 'SET_CONSTRAINTS':
            return { ...state, extractedConstraints: { ...state.extractedConstraints, ...action.payload } }
        case 'SET_MISSING_FIELDS':
            return { ...state, missingFields: action.payload }
        case 'SET_RECOMMENDATIONS':
            return { ...state, recommendedOptions: action.payload }
        case 'SELECT_OPTION':
            return { ...state, selectedOption: action.payload }
        case 'SELECT_SLOT':
            return { ...state, selectedSlot: action.payload }
        case 'SET_WORKFLOW_STATUS':
            return { ...state, workflowStatus: action.payload }
        case 'SET_APPOINTMENTS':
            return { ...state, appointmentResults: action.payload }
        case 'SET_BOOKING_DATA':
            return { ...state, bookingData: action.payload }
        case 'SET_CONFIRMATION':
            return { ...state, confirmationResult: action.payload }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'RESET_WORKFLOW':
            return {
                ...state,
                currentIntent: null,
                extractedConstraints: {},
                missingFields: [],
                recommendedOptions: [],
                selectedOption: null,
                selectedSlot: null,
                workflowStatus: 'idle',
                appointmentResults: [],
                bookingData: null,
                confirmationResult: null,
                isLoading: false,
            }
        default:
            return state
    }
}

// ─── Provider ───────────────────────────────────────────────────────────────────

export function AssistantProvider({ children }) {
    const [state, dispatch] = useReducer(assistantReducer, undefined, initAssistantState)

    // Persist state changes
    useEffect(() => {
        sessionStorage.setItem('carebook_assistant_state', JSON.stringify(state))
    }, [state])

    const addMessage = useCallback((role, type, content) => {
        dispatch({ type: 'ADD_MESSAGE', payload: { role, type, content } })
    }, [])

    // ── Main message handler ──────────────────────────────────────────────────

    const handleUserMessage = useCallback(async (text) => {
        // Add user message
        addMessage('user', 'text', text)
        dispatch({ type: 'SET_LOADING', payload: true })

        try {
            // If we're in clarification mode, treat the response as filling a constraint
            if (state.missingFields.length > 0 && state.currentIntent) {
                await handleClarificationResponse(text, state, dispatch, addMessage)
                return
            }

            // Detect intent
            const intent = detectIntent(text)
            const constraints = extractConstraints(text)

            if (!intent) {
                addMessage('assistant', 'text', "I'm not sure I understood that. I can help you:\n• **Find providers** — \"Find a dermatologist\"\n• **Book appointments** — \"Book a PCP appointment this week\"\n• **Reschedule** — \"Reschedule my appointment\"\n• **Cancel** — \"Cancel my upcoming appointment\"\n• **Check status** — \"Show my appointments\"\n\nWhat would you like to do?")
                return
            }

            dispatch({ type: 'SET_INTENT', payload: intent })
            dispatch({ type: 'SET_CONSTRAINTS', payload: constraints })

            // Check for missing required fields
            const missing = getMissingFields(intent, constraints)

            if (missing.length > 0) {
                dispatch({ type: 'SET_MISSING_FIELDS', payload: missing })
                const question = getClarificationQuestion(missing[0])
                addMessage('assistant', 'clarification', { field: missing[0], question })
                return
            }

            // Execute the workflow
            await executeWorkflow(intent, constraints, dispatch, addMessage)

        } catch (err) {
            console.error('Assistant error:', err)
            addMessage('assistant', 'error', 'Something went wrong. Please try again or use the navigation menu to proceed manually.')
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [state.missingFields, state.currentIntent, addMessage])

    // ── Select a provider recommendation ──────────────────────────────────────

    const selectRecommendation = useCallback(async (recommendation) => {
        dispatch({ type: 'SELECT_OPTION', payload: recommendation })
        dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'showing_options' })

        const provider = recommendation.provider
        addMessage('assistant', 'text', `Great choice! **Dr. ${provider.first_name} ${provider.last_name}** — ${provider.specialty} at ${provider.location}.\n\nHere are their available slots. Please select one:`)
        addMessage('assistant', 'slots', {
            provider,
            slots: recommendation.allSlots,
            recommendation
        })
    }, [addMessage])

    // ── Select a time slot ────────────────────────────────────────────────────

    const selectSlot = useCallback((date, time, provider) => {
        dispatch({ type: 'SELECT_SLOT', payload: { date, time } })
        dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'confirming' })

        const formattedDate = assistantService.formatFullDate(date)
        const formattedTime = assistantService.formatTime(time)

        addMessage('assistant', 'booking_review', {
            provider,
            date,
            time,
            formattedDate,
            formattedTime,
        })
    }, [addMessage])

    // ── Confirm booking ───────────────────────────────────────────────────────

    const confirmBooking = useCallback(async (bookingDetails) => {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'submitting' })
        addMessage('assistant', 'text', '⏳ Submitting your booking...')

        try {
            const result = await assistantService.submitBooking(bookingDetails)
            dispatch({ type: 'SET_CONFIRMATION', payload: result })
            dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'complete' })
            addMessage('assistant', 'confirmation', result)
        } catch (err) {
            addMessage('assistant', 'error', `Booking failed: ${err.message}. Please try again or book through the regular form.`)
            dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'error' })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [addMessage])

    // ── Confirm cancellation ──────────────────────────────────────────────────

    const confirmCancellation = useCallback(async (appointmentId, reason) => {
        dispatch({ type: 'SET_LOADING', payload: true })
        addMessage('assistant', 'text', '⏳ Cancelling your appointment...')

        try {
            const result = await assistantService.submitCancellation(appointmentId, reason)
            dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'complete' })
            addMessage('assistant', 'text', `✅ Your appointment has been **cancelled** successfully.\n\n${reason ? `Reason: ${reason}` : ''}\n\nThe time slot is now available for others. Is there anything else I can help with?`)
        } catch (err) {
            addMessage('assistant', 'error', `Cancellation failed: ${err.message}. Please try again.`)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [addMessage])

    // ── Confirm reschedule ────────────────────────────────────────────────────

    const confirmReschedule = useCallback(async (appointmentId, newDate, newTime) => {
        dispatch({ type: 'SET_LOADING', payload: true })
        addMessage('assistant', 'text', '⏳ Rescheduling your appointment...')

        try {
            const result = await assistantService.submitReschedule(appointmentId, {
                new_date: newDate,
                new_time: newTime
            })
            dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'complete' })
            addMessage('assistant', 'text', `✅ Your appointment has been **rescheduled** to **${assistantService.formatFullDate(newDate)}** at **${assistantService.formatTime(newTime)}**.\n\nIs there anything else I can help with?`)
        } catch (err) {
            addMessage('assistant', 'error', `Reschedule failed: ${err.message}. Please try again.`)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [addMessage])

    // ── Reset conversation ────────────────────────────────────────────────────

    const resetWorkflow = useCallback(() => {
        dispatch({ type: 'RESET_WORKFLOW' })
        addMessage('assistant', 'text', "I've cleared the current workflow. How else can I help you?")
    }, [addMessage])

    const togglePanel = useCallback(() => dispatch({ type: 'TOGGLE_PANEL' }), [])
    const openPanel = useCallback(() => dispatch({ type: 'OPEN_PANEL' }), [])
    const closePanel = useCallback(() => dispatch({ type: 'CLOSE_PANEL' }), [])

    const value = {
        ...state,
        dispatch,
        togglePanel,
        openPanel,
        closePanel,
        handleUserMessage,
        selectRecommendation,
        selectSlot,
        confirmBooking,
        confirmCancellation,
        confirmReschedule,
        resetWorkflow,
    }

    return (
        <AssistantContext.Provider value={value}>
            {children}
        </AssistantContext.Provider>
    )
}

export function useAssistant() {
    const context = useContext(AssistantContext)
    if (!context) throw new Error('useAssistant must be used within AssistantProvider')
    return context
}

// ─── Internal Helpers ───────────────────────────────────────────────────────────

async function handleClarificationResponse(text, state, dispatch, addMessage) {
    const newConstraints = extractConstraints(text)
    const currentField = state.missingFields[0]

    // Merge constraints (the NLU picks up the new info from the clarification response)
    const updatedConstraints = { ...state.extractedConstraints, ...newConstraints }

    // If the NLU didn't extract the specific field, try to use the raw text
    if (currentField === 'specialty' && !newConstraints.specialty) {
        // Try a simple match against common specialty names
        const specialties = ['Family Medicine', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Internal Medicine', 'OB/GYN', 'Neurology', 'Behavioral Health']
        const match = specialties.find(s => text.toLowerCase().includes(s.toLowerCase()))
        if (match) updatedConstraints.specialty = match
    }
    if (currentField === 'identification') {
        if (!newConstraints.email && !newConstraints.confirmationNumber) {
            // Check if the text itself is an email
            if (text.includes('@')) updatedConstraints.email = text.trim()
        }
    }

    dispatch({ type: 'SET_CONSTRAINTS', payload: updatedConstraints })

    // Check remaining missing fields
    const remaining = getMissingFields(state.currentIntent, updatedConstraints)
    const newRemaining = remaining.filter(f => f !== currentField || !updatedConstraints[currentField === 'identification' ? 'email' : currentField])

    if (newRemaining.length > 0) {
        dispatch({ type: 'SET_MISSING_FIELDS', payload: newRemaining })
        const question = getClarificationQuestion(newRemaining[0])
        addMessage('assistant', 'clarification', { field: newRemaining[0], question })
    } else {
        dispatch({ type: 'SET_MISSING_FIELDS', payload: [] })
        await executeWorkflow(state.currentIntent, updatedConstraints, dispatch, addMessage)
    }
}

async function executeWorkflow(intent, constraints, dispatch, addMessage) {
    dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'collecting_info' })

    switch (intent) {
        case 'search':
        case 'book': {
            addMessage('assistant', 'text', `🔍 Searching for ${constraints.specialty || 'available'} providers${constraints.datePreference ? ` for ${constraints.datePreference.replace(/_/g, ' ')}` : ''}...`)
            dispatch({ type: 'SET_LOADING', payload: true })

            try {
                const { providers, recommendations } = await assistantService.getRecommendations(constraints)

                if (recommendations.length === 0) {
                    if (providers.length === 0) {
                        addMessage('assistant', 'text', `I couldn't find any providers${constraints.specialty ? ` for ${constraints.specialty}` : ''}. Try broadening your search or use the **Find Providers** page to explore all available options.`)
                    } else {
                        addMessage('assistant', 'text', `I found ${providers.length} provider(s), but none have availability matching your preferences right now. Try adjusting your date or time preferences.`)
                    }
                    dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'idle' })
                    return
                }

                dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations })
                dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'showing_options' })

                const introText = intent === 'book'
                    ? `I found ${recommendations.length} provider(s) with availability. Here are my top recommendations:`
                    : `Here are the top ${recommendations.length} providers matching your search:`

                addMessage('assistant', 'text', introText)
                addMessage('assistant', 'recommendations', recommendations)
            } catch (err) {
                addMessage('assistant', 'error', `Search failed: ${err.message}. Please try again.`)
                dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'error' })
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
            break
        }

        case 'reschedule':
        case 'cancel':
        case 'status': {
            addMessage('assistant', 'text', '🔍 Looking up your appointments...')
            dispatch({ type: 'SET_LOADING', payload: true })

            try {
                const appointments = await assistantService.lookupAppointments(constraints)

                if (appointments.length === 0) {
                    addMessage('assistant', 'text', "I couldn't find any appointments with that information. Please double-check your email or confirmation number and try again.")
                    dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'idle' })
                    return
                }

                dispatch({ type: 'SET_APPOINTMENTS', payload: appointments })

                if (intent === 'status') {
                    addMessage('assistant', 'appointment_list', { appointments, action: 'view' })
                } else if (intent === 'cancel') {
                    const upcoming = appointments.filter(a => a.status === 'confirmed' && new Date(a.appointment_date) >= new Date())
                    if (upcoming.length === 0) {
                        addMessage('assistant', 'text', "You don't have any upcoming confirmed appointments to cancel.")
                        return
                    }
                    addMessage('assistant', 'appointment_list', { appointments: upcoming, action: 'cancel' })
                } else if (intent === 'reschedule') {
                    const upcoming = appointments.filter(a => a.status === 'confirmed' && new Date(a.appointment_date) >= new Date())
                    if (upcoming.length === 0) {
                        addMessage('assistant', 'text', "You don't have any upcoming confirmed appointments to reschedule.")
                        return
                    }
                    addMessage('assistant', 'appointment_list', { appointments: upcoming, action: 'reschedule' })
                }
            } catch (err) {
                addMessage('assistant', 'error', `Lookup failed: ${err.message}. Please try again.`)
                dispatch({ type: 'SET_WORKFLOW_STATUS', payload: 'error' })
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
            break
        }

        default:
            addMessage('assistant', 'text', "I'm not sure how to help with that. Could you try rephrasing?")
    }
}
