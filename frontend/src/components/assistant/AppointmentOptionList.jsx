import { useState } from 'react'
import { useAssistant } from '../../context/AssistantContext'
import { formatDate, formatTime } from '../../services/assistantService'
import RescheduleFlow from './RescheduleFlow'
import CancellationFlow from './CancellationFlow'

export default function AppointmentOptionList({ content }) {
  const { confirmCancellation, confirmReschedule } = useAssistant()
  const { appointments, action } = content
  const [activeFlow, setActiveFlow] = useState(null) // { type: 'reschedule'|'cancel', appointmentId: number }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-surface-50 rounded-2xl rounded-tl-md px-4 py-3">
        <p className="text-sm text-surface-500">No appointments found.</p>
      </div>
    )
  }

  // If an inline flow is active, render it
  if (activeFlow) {
    const apt = appointments.find(a => a.id === activeFlow.appointmentId)
    if (apt) {
      if (activeFlow.type === 'reschedule') {
        return <RescheduleFlow appointment={apt} />
      }
      if (activeFlow.type === 'cancel') {
        return <CancellationFlow appointment={apt} />
      }
    }
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => {
        const statusColors = {
          confirmed: 'bg-emerald-100 text-emerald-700',
          cancelled: 'bg-red-100 text-red-700',
          rescheduled: 'bg-blue-100 text-blue-700',
          completed: 'bg-surface-100 text-surface-600'
        }
        const providerName = apt.provider_first_name
          ? `Dr. ${apt.provider_first_name} ${apt.provider_last_name}`
          : 'Provider'

        const isUpcoming = apt.status === 'confirmed' && new Date(apt.appointment_date + 'T23:59:59') >= new Date()

        return (
          <div key={apt.id} className="bg-white rounded-xl border border-surface-200 shadow-sm p-3.5">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-surface-800">{providerName}</h4>
                <p className="text-xs text-surface-500">{apt.appointment_type_name || apt.specialty || 'Appointment'}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[apt.status] || 'bg-surface-100 text-surface-600'}`}>
                {apt.status}
              </span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-1.5 text-xs text-surface-600 mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
            </div>

            {/* Location */}
            {apt.provider_location && (
              <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {apt.provider_location}
              </div>
            )}

            {/* Interpreter badge */}
            {apt.interpreter_needed && (
              <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 rounded-md px-2 py-0.5 mb-1 w-fit">
                🌐 Interpreter: {apt.interpreter_language || 'Requested'}
              </div>
            )}

            {/* Confirmation # */}
            {apt.confirmation_number && (
              <p className="text-[10px] text-surface-400 mb-3">#{apt.confirmation_number}</p>
            )}

            {/* Action buttons */}
            {action === 'cancel' && isUpcoming && (
              <button
                onClick={() => setActiveFlow({ type: 'cancel', appointmentId: apt.id })}
                className="w-full py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Cancel This Appointment
              </button>
            )}

            {action === 'reschedule' && isUpcoming && (
              <button
                onClick={() => setActiveFlow({ type: 'reschedule', appointmentId: apt.id })}
                className="w-full py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Reschedule This Appointment
              </button>
            )}

            {action === 'view' && (
              <div className="flex gap-2">
                {isUpcoming && (
                  <>
                    <button
                      onClick={() => setActiveFlow({ type: 'reschedule', appointmentId: apt.id })}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setActiveFlow({ type: 'cancel', appointmentId: apt.id })}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => { window.location.href = `/appointments/${apt.id}` }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors"
                >
                  Details
                </button>
              </div>
            )}

            {/* Past / cancelled note */}
            {!isUpcoming && action !== 'view' && (
              <p className="text-[10px] text-surface-400 italic">
                {apt.status === 'cancelled' ? 'This appointment was cancelled.' : 'This appointment has passed.'}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
