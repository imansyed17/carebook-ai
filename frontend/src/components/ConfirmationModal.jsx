export default function ConfirmationModal({ isOpen, onClose, appointment }) {
    if (!isOpen || !appointment) return null

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12}:${minutes} ${ampm}`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="confirmation-modal">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-slide-up overflow-y-auto max-h-[90vh]">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce-gentle">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-display font-bold text-center text-surface-900 mb-2">
                    Appointment Confirmed! 🎉
                </h2>
                <p className="text-center text-surface-500 mb-6">
                    Your appointment has been successfully booked.
                </p>

                {/* Confirmation Number */}
                <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">Confirmation Number</p>
                    <p className="text-2xl font-display font-bold text-primary-800 tracking-widest">
                        {appointment.confirmation_number}
                    </p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
                        <span className="text-lg">👨‍⚕️</span>
                        <div>
                            <p className="text-xs text-surface-400 font-medium">Provider</p>
                            <p className="text-sm font-semibold text-surface-800">{appointment.provider_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
                        <span className="text-lg">📋</span>
                        <div>
                            <p className="text-xs text-surface-400 font-medium">Visit Type</p>
                            <p className="text-sm font-semibold text-surface-800">{appointment.appointment_type_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
                        <span className="text-lg">📅</span>
                        <div>
                            <p className="text-xs text-surface-400 font-medium">Date & Time</p>
                            <p className="text-sm font-semibold text-surface-800">
                                {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
                        <span className="text-lg">🏥</span>
                        <div>
                            <p className="text-xs text-surface-400 font-medium">Location</p>
                            <p className="text-sm font-semibold text-surface-800">{appointment.provider_location}</p>
                        </div>
                    </div>

                    {appointment.interpreter_needed && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <span className="text-lg">🌐</span>
                            <div>
                                <p className="text-xs text-amber-600 font-medium">Interpreter Requested</p>
                                <p className="text-sm font-semibold text-amber-800">{appointment.interpreter_language || 'Language not specified'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
                    <p className="text-xs text-blue-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                        A confirmation has been sent to your email/phone. Please arrive 15 minutes early.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full btn-primary text-center"
                    id="confirmation-close-btn"
                >
                    Done
                </button>
            </div>
        </div>
    )
}
