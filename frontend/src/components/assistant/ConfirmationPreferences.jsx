import { useState } from 'react'
import { formatFullDate, formatTime } from '../../services/assistantService'
import { useAssistant } from '../../context/AssistantContext'

export default function ConfirmationPreferences({ content }) {
  const { resetWorkflow } = useAssistant()
  const [deliveryMethod, setDeliveryMethod] = useState(null) // null = not yet selected
  const [deliverySent, setDeliverySent] = useState(false)

  if (!content) return null
  const appointment = content.appointment || content

  const handleSendConfirmation = (method) => {
    setDeliveryMethod(method)
    // Simulate sending
    setTimeout(() => setDeliverySent(true), 800)
  }

  return (
    <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
      {/* Success icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-800">Appointment Confirmed! 🎉</h4>
          <p className="text-xs text-emerald-600">Your booking is all set.</p>
        </div>
      </div>

      {/* Confirmation number */}
      {appointment.confirmation_number && (
        <div className="bg-white rounded-lg border border-emerald-200 p-2.5 mb-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Confirmation #</p>
          <p className="text-base font-bold text-emerald-800 font-mono tracking-wider">{appointment.confirmation_number}</p>
        </div>
      )}

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        {appointment.provider_name && (
          <DetailRow icon="👨‍⚕️" label="Provider" value={appointment.provider_name} />
        )}
        {appointment.appointment_type_name && (
          <DetailRow icon="📋" label="Visit Type" value={appointment.appointment_type_name} />
        )}
        {appointment.appointment_date && (
          <DetailRow
            icon="📅"
            label="Date & Time"
            value={`${formatFullDate(appointment.appointment_date)} at ${formatTime(appointment.appointment_time)}`}
          />
        )}
        {appointment.provider_location && (
          <DetailRow icon="🏥" label="Location" value={appointment.provider_location} />
        )}
        {appointment.interpreter_needed && (
          <DetailRow icon="🌐" label="Interpreter" value={appointment.interpreter_language || 'Requested'} />
        )}
      </div>

      {/* Communication preference */}
      {!deliverySent ? (
        <div className="bg-white rounded-lg border border-emerald-100 p-3 mb-3">
          <p className="text-xs font-semibold text-surface-700 mb-2">Send confirmation details via:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleSendConfirmation('email')}
              disabled={deliveryMethod !== null}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                deliveryMethod === 'email'
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-surface-200 text-surface-600 hover:border-primary-300 hover:text-primary-700'
              } ${deliveryMethod !== null && deliveryMethod !== 'email' ? 'opacity-40' : ''}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              {deliveryMethod === 'email' ? 'Sending...' : 'Email'}
            </button>
            <button
              onClick={() => handleSendConfirmation('text')}
              disabled={deliveryMethod !== null}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                deliveryMethod === 'text'
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-surface-200 text-surface-600 hover:border-primary-300 hover:text-primary-700'
              } ${deliveryMethod !== null && deliveryMethod !== 'text' ? 'opacity-40' : ''}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              {deliveryMethod === 'text' ? 'Sending...' : 'Text'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
          <p className="text-[11px] text-blue-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Confirmation sent via {deliveryMethod}! Please arrive 15 minutes early.
          </p>
        </div>
      )}

      {/* Start over */}
      <button
        onClick={resetWorkflow}
        className="w-full py-2 rounded-lg text-xs font-medium bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
      >
        Need anything else? Start a new request →
      </button>
    </div>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5">
      <span className="text-sm">{icon}</span>
      <div>
        <p className="text-[10px] text-surface-400">{label}</p>
        <p className="text-xs font-medium text-surface-700">{value}</p>
      </div>
    </div>
  )
}
