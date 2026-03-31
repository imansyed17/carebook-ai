import { useState, useEffect } from 'react'
import { useAssistant } from '../../context/AssistantContext'
import { getAvailability, fetchProvider, formatDate, formatTime, formatFullDate } from '../../services/assistantService'

export default function RescheduleFlow({ appointment }) {
  const { confirmReschedule, isLoading } = useAssistant()
  const [step, setStep] = useState('loading') // 'loading' | 'select_slot' | 'confirm' | 'error'
  const [availableSlots, setAvailableSlots] = useState({})
  const [provider, setProvider] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAlternativeSlots()
  }, [])

  const loadAlternativeSlots = async () => {
    try {
      setStep('loading')
      const providerData = await fetchProvider(appointment.provider_id)
      setProvider(providerData)

      const slots = await getAvailability(appointment.provider_id, {
        datePreference: 'this_week',
      })

      // If no slots this week, try next 30 days
      let finalSlots = slots
      if (Object.keys(slots).length === 0) {
        finalSlots = await getAvailability(appointment.provider_id, {})
      }

      // Remove the currently scheduled slot
      const currentDate = appointment.appointment_date
      const currentTime = appointment.appointment_time
      if (finalSlots[currentDate]) {
        finalSlots[currentDate] = finalSlots[currentDate].filter(t => t !== currentTime)
        if (finalSlots[currentDate].length === 0) {
          delete finalSlots[currentDate]
        }
      }

      setAvailableSlots(finalSlots)
      setStep(Object.keys(finalSlots).length > 0 ? 'select_slot' : 'error')
      if (Object.keys(finalSlots).length === 0) {
        setError('No alternative slots available for this provider. Try a different date range or provider.')
      }
    } catch (err) {
      setStep('error')
      setError(`Failed to load available slots: ${err.message}`)
    }
  }

  const handleSlotSelect = (date, time) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setStep('confirm')
  }

  const handleConfirm = () => {
    confirmReschedule(appointment.id, selectedDate, selectedTime)
  }

  const providerName = appointment.provider_first_name
    ? `Dr. ${appointment.provider_first_name} ${appointment.provider_last_name}`
    : provider ? `Dr. ${provider.first_name} ${provider.last_name}` : 'Your provider'

  // Loading state
  if (step === 'loading') {
    return (
      <div className="bg-white rounded-xl border border-surface-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-700 rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-surface-600">Finding alternative time slots...</p>
        </div>
        <CurrentAppointmentBadge appointment={appointment} providerName={providerName} />
      </div>
    )
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-4">
        <p className="text-xs text-red-700 mb-2">{error}</p>
        <button
          onClick={loadAlternativeSlots}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Confirm step
  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-surface-800">Confirm Reschedule</h4>
        </div>

        {/* Current → New */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-red-500 uppercase w-12">From</span>
            <div className="flex-1 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
              <p className="text-xs text-red-700 line-through">
                {formatFullDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-emerald-600 uppercase w-12">To</span>
            <div className="flex-1 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-700">
                {formatFullDate(selectedDate)} at {formatTime(selectedTime)}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-surface-500 mb-3">Provider: {providerName}</p>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Rescheduling...' : '✓ Confirm Reschedule'}
          </button>
          <button
            onClick={() => { setStep('select_slot'); setSelectedDate(null); setSelectedTime(null) }}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // Slot selection
  const dates = Object.keys(availableSlots).sort().slice(0, 7)

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4">
      <h4 className="text-sm font-bold text-surface-800 mb-1">Reschedule Appointment</h4>
      <CurrentAppointmentBadge appointment={appointment} providerName={providerName} />

      <p className="text-xs text-surface-500 mb-3 mt-3">Select a new time slot:</p>

      <div className="space-y-3 max-h-64 overflow-y-auto assistant-scroll">
        {dates.map(date => (
          <div key={date}>
            <p className="text-[11px] font-semibold text-surface-500 uppercase mb-1.5">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableSlots[date].slice(0, 8).map(time => {
                const [hours, minutes] = time.split(':')
                const h = parseInt(hours)
                const ampm = h >= 12 ? 'PM' : 'AM'
                const hour12 = h % 12 || 12
                return (
                  <button
                    key={`${date}-${time}`}
                    onClick={() => handleSlotSelect(date, time)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-surface-50 border border-surface-200 text-surface-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                  >
                    {hour12}:{minutes} {ampm}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CurrentAppointmentBadge({ appointment, providerName }) {
  return (
    <div className="bg-surface-50 rounded-lg px-3 py-2 border border-surface-100">
      <p className="text-[10px] font-semibold text-surface-400 uppercase mb-0.5">Current Appointment</p>
      <p className="text-xs font-medium text-surface-700">{providerName}</p>
      <p className="text-[11px] text-surface-500">
        {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
      </p>
    </div>
  )
}
