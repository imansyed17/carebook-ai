/**
 * CareBook AI — Assistant Service Layer
 * 
 * Orchestrates the conversational workflows by combining NLU results
 * with the existing API service functions. No external paid services.
 */

import {
    getProviders, getProvider, getProviderSlots, getSpecialties,
    getAppointmentTypes, bookAppointment, getAppointments, getAppointment,
    cancelAppointment, rescheduleAppointment
} from './api'
import { resolveDateRange } from './assistantNLU'

// ─── Provider Search ────────────────────────────────────────────────────────────

export async function searchProviders(constraints, member = null) {
    const params = {}
    if (constraints.specialty) params.specialty = constraints.specialty
    if (constraints.providerName) params.q = constraints.providerName
    
    // Inject member network & location context if available
    if (member) {
        if (member.planNetwork) params.network = member.planNetwork
        if (member.zip) params.zip_code = member.zip
    }

    const data = await getProviders(params)
    const providers = data.providers || []

    // Score and annotate each provider with a recommendation reason
    const scored = providers.map(provider => {
        const reasons = []
        if (constraints.specialty && provider.specialty === constraints.specialty) {
            reasons.push(`Specializes in ${constraints.specialty}`)
        }
        
        // Emphasize in-network status
        if (member && provider.accepted_networks && provider.accepted_networks.includes(member.planNetwork)) {
            reasons.unshift(`In-network for ${member.planName}`)
        } else if (member) {
            reasons.push('Out of network')
        }

        if (member && provider.distance) {
            reasons.push(`${provider.distance} miles from your home`)
        }

        if (provider.accepting_new_patients) {
            reasons.push('Accepting new patients')
        }
        if (provider.rating >= 4.5) {
            reasons.push(`Highly rated (${provider.rating}★)`)
        }
        return { ...provider, recommendationReasons: reasons }
    })

    // Sort: best match first
    scored.sort((a, b) => {
        // Prioritize in-network matches first
        if (member) {
            const aInNetwork = a.accepted_networks?.includes(member.planNetwork) ? 1 : 0
            const bInNetwork = b.accepted_networks?.includes(member.planNetwork) ? 1 : 0
            if (aInNetwork !== bInNetwork) return bInNetwork - aInNetwork
            // Then distance
            if (a.distance && b.distance) return a.distance - b.distance
        }
        return b.recommendationReasons.length - a.recommendationReasons.length || b.rating - a.rating
    })

    return scored.slice(0, 5)
}

// ─── Provider Availability ──────────────────────────────────────────────────────

export async function getAvailability(providerId, constraints) {
    const { startDate, endDate } = resolveDateRange(constraints.datePreference)

    // Get month-based slots from the API
    const month = startDate.substring(0, 7) // "YYYY-MM"
    const data = await getProviderSlots(providerId, { month })
    const slots = data.slots || {}

    // Filter by date range
    const filteredSlots = {}
    for (const [date, times] of Object.entries(slots)) {
        if (date >= startDate && date <= endDate) {
            // Filter by time of day if specified
            const filteredTimes = constraints.timeOfDay
                ? times.filter(time => matchesTimeOfDay(time, constraints.timeOfDay))
                : times
            if (filteredTimes.length > 0) {
                filteredSlots[date] = filteredTimes
            }
        }
    }

    return filteredSlots
}

function matchesTimeOfDay(timeStr, preference) {
    const hour = parseInt(timeStr.split(':')[0])
    switch (preference) {
        case 'morning': return hour >= 7 && hour < 12
        case 'afternoon': return hour >= 12 && hour < 17
        case 'evening': return hour >= 17 && hour <= 20
        default: return true
    }
}

// ─── Build Recommendation Cards ─────────────────────────────────────────────────

export async function getRecommendations(constraints, member = null) {
    const providers = await searchProviders(constraints, member)
    if (providers.length === 0) {
        return { providers: [], recommendations: [] }
    }

    // Get availability for top 3 providers
    const topProviders = providers.slice(0, 3)
    const recommendations = []

    for (const provider of topProviders) {
        try {
            const slots = await getAvailability(provider.id, constraints)
            const allDates = Object.keys(slots).sort()

            if (allDates.length > 0) {
                const nextDate = allDates[0]
                const nextTime = slots[nextDate][0]
                const reasons = [...provider.recommendationReasons]

                // Add availability-specific reasons
                if (allDates[0] === new Date().toISOString().split('T')[0]) {
                    reasons.unshift('Available today')
                } else if (allDates.length > 0) {
                    reasons.unshift('Earliest available')
                }
                if (constraints.timeOfDay) {
                    reasons.push(`Matches ${constraints.timeOfDay} preference`)
                }

                recommendations.push({
                    provider,
                    nextAvailableDate: nextDate,
                    nextAvailableTime: nextTime,
                    totalSlots: Object.values(slots).flat().length,
                    availableDates: allDates.slice(0, 5),
                    allSlots: slots,
                    reasons
                })
            }
        } catch (err) {
            console.warn(`Could not fetch availability for provider ${provider.id}:`, err)
        }
    }

    // Sort by earliest availability
    recommendations.sort((a, b) => {
        const dateA = `${a.nextAvailableDate}T${a.nextAvailableTime}`
        const dateB = `${b.nextAvailableDate}T${b.nextAvailableTime}`
        return dateA.localeCompare(dateB)
    })

    return { providers, recommendations }
}

// ─── Appointment Lookup ─────────────────────────────────────────────────────────

export async function lookupAppointments(constraints) {
    const params = {}
    if (constraints.email) params.email = constraints.email
    if (constraints.confirmationNumber) params.confirmation_number = constraints.confirmationNumber

    const data = await getAppointments(params)
    return data.appointments || []
}

export async function lookupSingleAppointment(appointmentId) {
    return await getAppointment(appointmentId)
}

// ─── Booking ────────────────────────────────────────────────────────────────────

export async function submitBooking(bookingData) {
    return await bookAppointment(bookingData)
}

// ─── Reschedule ─────────────────────────────────────────────────────────────────

export async function submitReschedule(appointmentId, newData) {
    return await rescheduleAppointment(appointmentId, newData)
}

// ─── Cancellation ───────────────────────────────────────────────────────────────

export async function submitCancellation(appointmentId, reason) {
    return await cancelAppointment(appointmentId, reason)
}

// ─── Specialties List ───────────────────────────────────────────────────────────

export async function fetchSpecialties() {
    return await getSpecialties()
}

// ─── Appointment Types ──────────────────────────────────────────────────────────

export async function fetchAppointmentTypes() {
    return await getAppointmentTypes()
}

// ─── Fetch Single Provider ──────────────────────────────────────────────────────

export async function fetchProvider(providerId) {
    return await getProvider(providerId)
}

// ─── Format Helpers ─────────────────────────────────────────────────────────────

export function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
}

export function formatFullDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
