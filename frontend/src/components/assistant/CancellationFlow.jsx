import { useState } from 'react'
import { useAssistant } from '../../context/AssistantContext'
import { formatDate, formatTime } from '../../services/assistantService'

export default function CancellationFlow({ appointment }) {
  const { confirmCancellation, isLoading } = useAssistant()
  const [step, setStep] = useState('reason') // 'reason' | 'confirm'
  const [cancelReason, setCancelReason] = useState('')

  const reasons = [
    'Schedule conflict',
    'Feeling better',
    'Found another provider',
    'Personal reasons',
    'Other'
  ]

  const providerName = appointment.provider_first_name
    ? `Dr. ${appointment.provider_first_name} ${appointment.provider_last_name}`
    : 'Provider'

  const handleConfirm = () => {
    confirmCancellation(appointment.id, cancelReason)
  }

  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-xl border-2 border-red-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-red-800">Confirm Cancellation</h4>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-red-800 mb-1">You are cancelling:</p>
          <p className="text-xs text-red-700">{providerName}</p>
          <p className="text-xs text-red-600">
            {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
          </p>
          {appointment.appointment_type_name && (
            <p className="text-[10px] text-red-500 mt-0.5">{appointment.appointment_type_name}</p>
          )}
          {cancelReason && (
            <p className="text-[10px] text-red-500 mt-1 italic">Reason: {cancelReason}</p>
          )}
        </div>

        <p className="text-[11px] text-surface-500 mb-3">
          This action cannot be undone. The time slot will be released for other patients.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Cancelling...' : '✗ Yes, Cancel Appointment'}
          </button>
          <button
            onClick={() => setStep('reason')}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Reason selection step
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4">
      <h4 className="text-sm font-bold text-surface-800 mb-1">Cancel Appointment</h4>

      {/* Appointment details */}
      <div className="bg-surface-50 rounded-lg px-3 py-2 border border-surface-100 mb-3">
        <p className="text-xs font-medium text-surface-700">{providerName}</p>
        <p className="text-[11px] text-surface-500">
          {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
        </p>
        {appointment.confirmation_number && (
          <p className="text-[10px] text-surface-400 mt-0.5">#{appointment.confirmation_number}</p>
        )}
      </div>

      <p className="text-xs text-surface-600 mb-2">Why are you cancelling? (optional)</p>

      {/* Quick reason chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {reasons.map(reason => (
          <button
            key={reason}
            onClick={() => setCancelReason(reason)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
              cancelReason === reason
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'
            }`}
          >
            {reason}
          </button>
        ))}
      </div>

      {/* Custom reason */}
      {cancelReason === 'Other' && (
        <input
          type="text"
          placeholder="Please specify..."
          onChange={(e) => setCancelReason(e.target.value || 'Other')}
          className="assistant-input mb-3"
        />
      )}

      <button
        onClick={() => setStep('confirm')}
        className="w-full py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
      >
        Continue to Cancellation →
      </button>
    </div>
  )
}
