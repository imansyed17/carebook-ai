import { useState, useEffect } from 'react'
import { useAssistant } from '../../context/AssistantContext'
import { fetchAppointmentTypes } from '../../services/assistantService'
import { formatFullDate, formatTime } from '../../services/assistantService'

export default function BookingReviewModal({ content }) {
    const { confirmBooking, isLoading } = useAssistant()
    const { provider, date, time, formattedDate, formattedTime } = content

    const [patientInfo, setPatientInfo] = useState({
        patient_first_name: '',
        patient_last_name: '',
        patient_email: '',
        patient_phone: '',
        appointment_type_id: '',
        reason_for_visit: '',
        interpreter_needed: false,
        interpreter_language: '',
        notification_preference: 'email',
    })
    const [appointmentTypes, setAppointmentTypes] = useState([])
    const [step, setStep] = useState('form') // 'form' | 'review'
    const [errors, setErrors] = useState({})

    useEffect(() => {
        fetchAppointmentTypes().then(types => {
            setAppointmentTypes(types || [])
            if (types && types.length > 0) {
                setPatientInfo(prev => ({ ...prev, appointment_type_id: types[0].id }))
            }
        }).catch(() => { })
    }, [])

    const handleChange = (field, value) => {
        setPatientInfo(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: null }))
    }

    const validate = () => {
        const errs = {}
        if (!patientInfo.patient_first_name.trim()) errs.patient_first_name = 'Required'
        if (!patientInfo.patient_last_name.trim()) errs.patient_last_name = 'Required'
        if (!patientInfo.patient_email.trim() || !/\S+@\S+\.\S+/.test(patientInfo.patient_email)) errs.patient_email = 'Valid email required'
        if (!patientInfo.patient_phone.trim()) errs.patient_phone = 'Required'
        if (!patientInfo.appointment_type_id) errs.appointment_type_id = 'Required'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleReview = () => {
        if (validate()) setStep('review')
    }

    const handleConfirm = () => {
        confirmBooking({
            provider_id: provider.id,
            appointment_type_id: parseInt(patientInfo.appointment_type_id),
            patient_first_name: patientInfo.patient_first_name,
            patient_last_name: patientInfo.patient_last_name,
            patient_email: patientInfo.patient_email,
            patient_phone: patientInfo.patient_phone,
            appointment_date: date,
            appointment_time: time,
            interpreter_needed: patientInfo.interpreter_needed,
            interpreter_language: patientInfo.interpreter_language || null,
            reason_for_visit: patientInfo.reason_for_visit || null,
            notification_preference: patientInfo.notification_preference,
        })
    }

    if (step === 'review') {
        const typeName = appointmentTypes.find(t => t.id === parseInt(patientInfo.appointment_type_id))?.name || 'Appointment'
        return (
            <div className="bg-white rounded-xl border-2 border-primary-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-bold text-surface-800">Review & Confirm</h4>
                </div>

                <div className="space-y-2 mb-4">
                    <ReviewRow label="Provider" value={`Dr. ${provider.first_name} ${provider.last_name}`} />
                    <ReviewRow label="Specialty" value={provider.specialty} />
                    <ReviewRow label="Date" value={formattedDate} />
                    <ReviewRow label="Time" value={formattedTime} />
                    <ReviewRow label="Visit Type" value={typeName} />
                    <ReviewRow label="Patient" value={`${patientInfo.patient_first_name} ${patientInfo.patient_last_name}`} />
                    <ReviewRow label="Email" value={patientInfo.patient_email} />
                    <ReviewRow label="Phone" value={patientInfo.patient_phone} />
                    {patientInfo.interpreter_needed && (
                        <ReviewRow label="Interpreter" value={patientInfo.interpreter_language || 'Requested'} />
                    )}
                    <ReviewRow label="Notification" value={patientInfo.notification_preference} />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-primary-700 text-white hover:bg-primary-800 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Booking...' : '✓ Confirm Booking'}
                    </button>
                    <button
                        onClick={() => setStep('form')}
                        className="py-2 px-3 rounded-lg text-xs font-semibold bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
                    >
                        Edit
                    </button>
                </div>
            </div>
        )
    }

    // Form step
    return (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
            <div className="mb-3">
                <h4 className="text-sm font-bold text-surface-800 mb-0.5">Complete Your Booking</h4>
                <p className="text-xs text-surface-500">
                    Dr. {provider.first_name} {provider.last_name} · {formattedDate} at {formattedTime}
                </p>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <FormField label="First Name" error={errors.patient_first_name}>
                        <input type="text" value={patientInfo.patient_first_name} onChange={e => handleChange('patient_first_name', e.target.value)}
                            className="assistant-input" placeholder="John" />
                    </FormField>
                    <FormField label="Last Name" error={errors.patient_last_name}>
                        <input type="text" value={patientInfo.patient_last_name} onChange={e => handleChange('patient_last_name', e.target.value)}
                            className="assistant-input" placeholder="Doe" />
                    </FormField>
                </div>

                <FormField label="Email" error={errors.patient_email}>
                    <input type="email" value={patientInfo.patient_email} onChange={e => handleChange('patient_email', e.target.value)}
                        className="assistant-input" placeholder="john@example.com" />
                </FormField>

                <FormField label="Phone" error={errors.patient_phone}>
                    <input type="tel" value={patientInfo.patient_phone} onChange={e => handleChange('patient_phone', e.target.value)}
                        className="assistant-input" placeholder="(555) 123-4567" />
                </FormField>

                <FormField label="Visit Type" error={errors.appointment_type_id}>
                    <select value={patientInfo.appointment_type_id} onChange={e => handleChange('appointment_type_id', e.target.value)}
                        className="assistant-input">
                        {appointmentTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Reason for Visit (optional)">
                    <input type="text" value={patientInfo.reason_for_visit} onChange={e => handleChange('reason_for_visit', e.target.value)}
                        className="assistant-input" placeholder="Brief description..." />
                </FormField>

                {/* Interpreter */}
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={patientInfo.interpreter_needed} id="interpreter-check"
                        onChange={e => handleChange('interpreter_needed', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500" />
                    <label htmlFor="interpreter-check" className="text-xs text-surface-600">I need an interpreter</label>
                </div>
                {patientInfo.interpreter_needed && (
                    <FormField label="Language">
                        <input type="text" value={patientInfo.interpreter_language} onChange={e => handleChange('interpreter_language', e.target.value)}
                            className="assistant-input" placeholder="e.g., Spanish, Mandarin" />
                    </FormField>
                )}

                {/* Notification preference */}
                <FormField label="Send confirmation via">
                    <div className="flex gap-2">
                        {['email', 'sms', 'both'].map(opt => (
                            <button key={opt} onClick={() => handleChange('notification_preference', opt)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${patientInfo.notification_preference === opt
                                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                                    : 'bg-white border-surface-200 text-surface-500 hover:border-surface-300'}`}
                            >
                                {opt === 'sms' ? 'Text' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </button>
                        ))}
                    </div>
                </FormField>

                <button onClick={handleReview}
                    className="w-full py-2 rounded-lg text-xs font-semibold bg-primary-700 text-white hover:bg-primary-800 transition-colors mt-2"
                >
                    Review Booking →
                </button>
            </div>
        </div>
    )
}

function FormField({ label, error, children }) {
    return (
        <div>
            <label className="block text-[11px] font-semibold text-surface-600 mb-0.5">{label}</label>
            {children}
            {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
        </div>
    )
}

function ReviewRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-surface-50">
            <span className="text-[11px] text-surface-500">{label}</span>
            <span className="text-xs font-medium text-surface-800 text-right">{value}</span>
        </div>
    )
}
