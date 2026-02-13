import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getAppointment, cancelAppointment, rescheduleAppointment, getProviderSlots } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function AppointmentDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Cancel state
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelling, setCancelling] = useState(false)

    // Reschedule state
    const [showReschedule, setShowReschedule] = useState(false)
    const [rescheduleSlots, setRescheduleSlots] = useState({})
    const [rescheduleDate, setRescheduleDate] = useState('')
    const [rescheduleTime, setRescheduleTime] = useState('')
    const [rescheduling, setRescheduling] = useState(false)
    const [slotsLoading, setSlotsLoading] = useState(false)
    const [availableDates, setAvailableDates] = useState([])

    useEffect(() => {
        loadAppointment()
    }, [id])

    const loadAppointment = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAppointment(id)
            setAppointment(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async () => {
        setCancelling(true)
        try {
            await cancelAppointment(id, cancelReason)
            setShowCancelModal(false)
            loadAppointment()
        } catch (err) {
            setError(err.message)
        } finally {
            setCancelling(false)
        }
    }

    const handleShowReschedule = async () => {
        setShowReschedule(true)
        setSlotsLoading(true)
        try {
            const data = await getProviderSlots(appointment.provider_id)
            setRescheduleSlots(data.slots)
            setAvailableDates(Object.keys(data.slots).filter(d => data.slots[d].length > 0).sort())
        } catch (err) {
            setError(err.message)
        } finally {
            setSlotsLoading(false)
        }
    }

    const handleReschedule = async () => {
        if (!rescheduleDate || !rescheduleTime) return
        setRescheduling(true)
        try {
            await rescheduleAppointment(id, {
                appointment_date: rescheduleDate,
                appointment_time: rescheduleTime
            })
            setShowReschedule(false)
            loadAppointment()
        } catch (err) {
            setError(err.message)
        } finally {
            setRescheduling(false)
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12}:${minutes} ${ampm}`
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'rescheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-surface-100 text-surface-700 border-surface-200'
        }
    }

    if (loading) return <div className="page-container"><LoadingSpinner text="Loading appointment..." /></div>
    if (error && !appointment) return <div className="page-container"><ErrorMessage message={error} onRetry={loadAppointment} /></div>
    if (!appointment) return <div className="page-container"><ErrorMessage message="Appointment not found" /></div>

    const canModify = appointment.status !== 'cancelled'

    return (
        <div className="page-container animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
                <Link to="/appointments" className="hover:text-primary-600 transition-colors">My Appointments</Link>
                <span>/</span>
                <span className="text-surface-800 font-medium">{appointment.confirmation_number}</span>
            </nav>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6" id="appointment-status-card">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">Confirmation Number</p>
                                <p className="text-2xl font-display font-bold text-surface-900 font-mono tracking-wider">{appointment.confirmation_number}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(appointment.status)}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                    </svg>
                                    <span className="text-xs text-surface-500 font-semibold uppercase">Date</span>
                                </div>
                                <p className="font-semibold text-surface-800">{formatDate(appointment.appointment_date)}</p>
                            </div>

                            <div className="bg-surface-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <span className="text-xs text-surface-500 font-semibold uppercase">Time</span>
                                </div>
                                <p className="font-semibold text-surface-800">{formatTime(appointment.appointment_time)}</p>
                            </div>

                            <div className="bg-surface-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                    <span className="text-xs text-surface-500 font-semibold uppercase">Visit Type</span>
                                </div>
                                <p className="font-semibold text-surface-800">{appointment.appointment_type_name}</p>
                                <p className="text-xs text-surface-400">{appointment.duration_minutes} minutes</p>
                            </div>

                            <div className="bg-surface-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>
                                    <span className="text-xs text-surface-500 font-semibold uppercase">Location</span>
                                </div>
                                <p className="font-semibold text-surface-800">{appointment.provider_location}</p>
                                <p className="text-xs text-surface-400">{appointment.provider_address}</p>
                            </div>
                        </div>

                        {appointment.interpreter_needed && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                                <span className="text-xl">🌐</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Interpreter Requested</p>
                                    <p className="text-xs text-amber-600">{appointment.interpreter_language || 'Language not specified'}</p>
                                </div>
                            </div>
                        )}

                        {appointment.reason_for_visit && (
                            <div className="mt-4 bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-500 font-semibold uppercase mb-1">Reason for Visit</p>
                                <p className="text-sm text-surface-700">{appointment.reason_for_visit}</p>
                            </div>
                        )}
                    </div>

                    {/* Provider Details */}
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6" id="provider-details-card">
                        <h2 className="text-lg font-display font-bold text-surface-900 mb-4">Provider Information</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                                {appointment.provider_avatar ? (
                                    <img src={appointment.provider_avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-display font-bold text-primary-700">
                                        {appointment.provider_first_name[0]}{appointment.provider_last_name[0]}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-surface-900">{appointment.provider_name}</h3>
                                <p className="text-primary-600 text-sm font-medium">{appointment.provider_specialty}</p>
                                <p className="text-surface-500 text-sm mt-1">{appointment.provider_phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reschedule Section */}
                    {showReschedule && canModify && (
                        <div className="bg-white rounded-2xl shadow-card border-2 border-blue-200 p-6 animate-slide-up" id="reschedule-section">
                            <h2 className="text-lg font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                                </svg>
                                Reschedule Appointment
                            </h2>

                            {slotsLoading ? (
                                <LoadingSpinner size="sm" text="Loading available slots..." />
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="label-text">Select New Date</label>
                                        <select
                                            value={rescheduleDate}
                                            onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleTime(''); }}
                                            className="input-field"
                                            id="reschedule-date"
                                        >
                                            <option value="">Choose a date...</option>
                                            {availableDates.slice(0, 30).map(date => (
                                                <option key={date} value={date}>
                                                    {formatDate(date)} ({rescheduleSlots[date]?.length} slots)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {rescheduleDate && rescheduleSlots[rescheduleDate] && (
                                        <div>
                                            <label className="label-text">Select New Time</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                                {rescheduleSlots[rescheduleDate].map(time => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={() => setRescheduleTime(time)}
                                                        className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${rescheduleTime === time
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'bg-surface-50 border border-surface-200 text-surface-700 hover:bg-blue-50'
                                                            }`}
                                                    >
                                                        {formatTime(time)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleReschedule}
                                            disabled={!rescheduleDate || !rescheduleTime || rescheduling}
                                            className="btn-primary"
                                            id="confirm-reschedule-btn"
                                        >
                                            {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                                        </button>
                                        <button
                                            onClick={() => setShowReschedule(false)}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    {/* Actions */}
                    {canModify && (
                        <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6" id="appointment-actions">
                            <h2 className="text-lg font-display font-bold text-surface-900 mb-4">Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={handleShowReschedule}
                                    className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                                    id="reschedule-btn"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                                    </svg>
                                    Reschedule
                                </button>
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full btn-danger text-sm flex items-center justify-center gap-2"
                                    id="cancel-btn"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                    Cancel Appointment
                                </button>
                            </div>
                        </div>
                    )}

                    {appointment.status === 'cancelled' && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <h3 className="font-semibold text-red-800 mb-2">Appointment Cancelled</h3>
                            {appointment.cancel_reason && (
                                <p className="text-sm text-red-600 mb-2">Reason: {appointment.cancel_reason}</p>
                            )}
                            {appointment.cancelled_at && (
                                <p className="text-xs text-red-500">Cancelled: {new Date(appointment.cancelled_at).toLocaleDateString()}</p>
                            )}
                            <Link to="/providers" className="btn-primary mt-4 text-sm w-full text-center block">
                                Book New Appointment
                            </Link>
                        </div>
                    )}

                    {/* Patient Info */}
                    <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6" id="patient-details-card">
                        <h2 className="text-lg font-display font-bold text-surface-900 mb-4">Patient Information</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-surface-400 text-xs font-medium uppercase">Name</p>
                                <p className="font-semibold text-surface-800">{appointment.patient_first_name} {appointment.patient_last_name}</p>
                            </div>
                            <div>
                                <p className="text-surface-400 text-xs font-medium uppercase">Email</p>
                                <p className="text-surface-700">{appointment.patient_email}</p>
                            </div>
                            <div>
                                <p className="text-surface-400 text-xs font-medium uppercase">Phone</p>
                                <p className="text-surface-700">{appointment.patient_phone}</p>
                            </div>
                            {appointment.patient_dob && (
                                <div>
                                    <p className="text-surface-400 text-xs font-medium uppercase">Date of Birth</p>
                                    <p className="text-surface-700">{formatDate(appointment.patient_dob)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Helpful Info */}
                    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6">
                        <h3 className="font-display font-bold text-primary-800 mb-3">📋 Visit Checklist</h3>
                        <ul className="space-y-2 text-sm text-primary-700">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                                Arrive 15 minutes early
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                                Bring photo ID & insurance card
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                                List of current medications
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                                Previous medical records (if any)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="cancel-modal">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-display font-bold text-center text-surface-900 mb-2">Cancel Appointment?</h3>
                        <p className="text-center text-surface-500 text-sm mb-6">
                            This will cancel your appointment with {appointment.provider_name} on {formatDate(appointment.appointment_date)}.
                        </p>
                        <div className="mb-6">
                            <label className="label-text">Reason (optional)</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Tell us why you're cancelling..."
                                className="input-field resize-none"
                                rows={3}
                                id="cancel-reason-input"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="flex-1 btn-danger"
                                id="confirm-cancel-btn"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 btn-secondary"
                            >
                                Keep It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
