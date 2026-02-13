import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProvider, getProviderSlots, getAppointmentTypes, bookAppointment } from '../services/api'
import ConfirmationModal from '../components/ConfirmationModal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function BookAppointment() {
    const { providerId } = useParams()
    const navigate = useNavigate()

    const [provider, setProvider] = useState(null)
    const [slots, setSlots] = useState({})
    const [appointmentTypes, setAppointmentTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [slotsLoading, setSlotsLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [confirmedAppointment, setConfirmedAppointment] = useState(null)

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        patient_first_name: '',
        patient_last_name: '',
        patient_email: '',
        patient_phone: '',
        patient_dob: '',
        appointment_type_id: '',
        interpreter_needed: false,
        interpreter_language: '',
        reason_for_visit: '',
        notification_preference: 'email'
    })

    useEffect(() => {
        loadData()
    }, [providerId])

    useEffect(() => {
        if (provider) {
            const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
            loadSlots(monthStr)
        }
    }, [currentMonth, provider])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [providerData, typesData] = await Promise.all([
                getProvider(providerId),
                getAppointmentTypes()
            ])
            setProvider(providerData)
            setAppointmentTypes(typesData)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const loadSlots = async (month) => {
        setSlotsLoading(true)
        try {
            const data = await getProviderSlots(providerId, { month })
            setSlots(data.slots)
        } catch (err) {
            console.error('Failed to load slots:', err)
        } finally {
            setSlotsLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Clear field error
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const validateForm = () => {
        const errors = {}

        if (!formData.patient_first_name.trim()) errors.patient_first_name = 'First name is required'
        else if (!/^[a-zA-Z\s'-]+$/.test(formData.patient_first_name)) errors.patient_first_name = 'Only letters allowed'

        if (!formData.patient_last_name.trim()) errors.patient_last_name = 'Last name is required'
        else if (!/^[a-zA-Z\s'-]+$/.test(formData.patient_last_name)) errors.patient_last_name = 'Only letters allowed'

        if (!formData.patient_email.trim()) errors.patient_email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patient_email)) errors.patient_email = 'Invalid email format'

        if (!formData.patient_phone.trim()) errors.patient_phone = 'Phone number is required'
        else if (!/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(formData.patient_phone)) errors.patient_phone = 'Format: (555) 123-4567'

        if (!formData.appointment_type_id) errors.appointment_type_id = 'Appointment type is required'

        if (!selectedDate) errors.date = 'Please select a date'
        if (!selectedTime) errors.time = 'Please select a time'

        if (formData.interpreter_needed && !formData.interpreter_language.trim()) {
            errors.interpreter_language = 'Please specify the language'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        setError(null)

        try {
            const payload = {
                ...formData,
                provider_id: parseInt(providerId),
                appointment_type_id: parseInt(formData.appointment_type_id),
                appointment_date: selectedDate,
                appointment_time: selectedTime,
                interpreter_needed: formData.interpreter_needed
            }

            const result = await bookAppointment(payload)
            setConfirmedAppointment(result.appointment)
            setShowConfirmation(true)
        } catch (err) {
            setError(err.message)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleConfirmationClose = () => {
        setShowConfirmation(false)
        navigate('/appointments')
    }

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return { firstDay, daysInMonth }
    }

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + direction)
        setCurrentMonth(newMonth)
        setSelectedDate(null)
        setSelectedTime(null)
    }

    const selectDate = (day) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        setSelectedDate(dateStr)
        setSelectedTime(null)
        if (formErrors.date) setFormErrors(prev => ({ ...prev, date: null }))
    }

    const selectTime = (time) => {
        setSelectedTime(time)
        if (formErrors.time) setFormErrors(prev => ({ ...prev, time: null }))
    }

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12}:${minutes} ${ampm}`
    }

    const isDateAvailable = (day) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return slots[dateStr] && slots[dateStr].length > 0
    }

    const isDatePast = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        return date <= today
    }

    if (loading) return <div className="page-container"><LoadingSpinner text="Loading provider details..." /></div>
    if (error && !provider) return <div className="page-container"><ErrorMessage message={error} onRetry={loadData} /></div>
    if (!provider) return <div className="page-container"><ErrorMessage message="Provider not found" /></div>

    return (
        <div className="page-container animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
                <Link to="/providers" className="hover:text-primary-600 transition-colors">Providers</Link>
                <span>/</span>
                <span className="text-surface-800 font-medium">Dr. {provider.first_name} {provider.last_name}</span>
            </nav>

            {/* Provider Info Banner */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6 mb-8" id="provider-info-banner">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center shadow-sm flex-shrink-0">
                        {provider.avatar_url ? (
                            <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-display font-bold text-primary-700">{provider.first_name[0]}{provider.last_name[0]}</span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-surface-900">
                            Dr. {provider.first_name} {provider.last_name}, {provider.title}
                        </h1>
                        <p className="text-primary-600 font-medium">{provider.specialty}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-surface-500 text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {provider.location} · {provider.address}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Calendar & Time */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Calendar */}
                        <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6" id="calendar-section">
                            <h2 className="text-xl font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                Select Date
                            </h2>

                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => navigateMonth(-1)}
                                    className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                                    id="prev-month-btn"
                                >
                                    <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <h3 className="text-lg font-semibold text-surface-800">
                                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => navigateMonth(1)}
                                    className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                                    id="next-month-btn"
                                >
                                    <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>

                            {slotsLoading ? (
                                <LoadingSpinner size="sm" text="Loading availability..." />
                            ) : (
                                <>
                                    {/* Day headers */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="text-center text-xs font-semibold text-surface-400 py-2">{day}</div>
                                        ))}
                                    </div>

                                    {/* Calendar grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {/* Empty cells */}
                                        {[...Array(firstDay)].map((_, i) => (
                                            <div key={`empty-${i}`} className="aspect-square"></div>
                                        ))}
                                        {/* Day cells */}
                                        {[...Array(daysInMonth)].map((_, i) => {
                                            const day = i + 1
                                            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                            const available = isDateAvailable(day)
                                            const past = isDatePast(day)
                                            const isWeekend = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay() === 0 || new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay() === 6
                                            const isSelected = selectedDate === dateStr

                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    disabled={past || !available || isWeekend}
                                                    onClick={() => selectDate(day)}
                                                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${isSelected
                                                            ? 'bg-primary-600 text-white shadow-lg scale-105'
                                                            : past || isWeekend
                                                                ? 'text-surface-300 cursor-not-allowed'
                                                                : available
                                                                    ? 'text-surface-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer'
                                                                    : 'text-surface-300 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {day}
                                                    {available && !past && !isWeekend && !isSelected && (
                                                        <span className="absolute bottom-1 w-1 h-1 bg-primary-400 rounded-full"></span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            )}

                            {formErrors.date && (
                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                    </svg>
                                    {formErrors.date}
                                </p>
                            )}
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6 animate-slide-up" id="time-slots-section">
                                <h2 className="text-xl font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    Available Times for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h2>

                                {slots[selectedDate] && slots[selectedDate].length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                        {slots[selectedDate].map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => selectTime(time)}
                                                className={`py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${selectedTime === time
                                                        ? 'bg-primary-600 text-white shadow-md'
                                                        : 'bg-surface-50 text-surface-700 hover:bg-primary-50 hover:text-primary-700 border border-surface-200'
                                                    }`}
                                                id={`time-slot-${time.replace(':', '')}`}
                                            >
                                                {formatTime(time)}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-surface-500 text-sm">No available slots for this date.</p>
                                )}

                                {formErrors.time && (
                                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                        </svg>
                                        {formErrors.time}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right column - Form */}
                    <div className="space-y-6">
                        {/* Appointment Type */}
                        <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6" id="appointment-type-section">
                            <h2 className="text-lg font-display font-bold text-surface-900 mb-4">Appointment Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="label-text" htmlFor="appointment_type_id">Appointment Type *</label>
                                    <select
                                        name="appointment_type_id"
                                        id="appointment_type_id"
                                        value={formData.appointment_type_id}
                                        onChange={handleInputChange}
                                        className={`input-field ${formErrors.appointment_type_id ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                                    >
                                        <option value="">Select type...</option>
                                        {appointmentTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name} ({type.duration_minutes} min)
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.appointment_type_id && <p className="text-red-500 text-xs mt-1">{formErrors.appointment_type_id}</p>}
                                </div>

                                <div>
                                    <label className="label-text" htmlFor="reason_for_visit">Reason for Visit</label>
                                    <textarea
                                        name="reason_for_visit"
                                        id="reason_for_visit"
                                        value={formData.reason_for_visit}
                                        onChange={handleInputChange}
                                        placeholder="Briefly describe your reason..."
                                        className="input-field resize-none"
                                        rows={3}
                                        maxLength={500}
                                    />
                                </div>

                                {/* Interpreter */}
                                <div className="pt-2 border-t border-surface-100">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="interpreter_needed"
                                            id="interpreter_needed"
                                            checked={formData.interpreter_needed}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 rounded-md border-2 border-surface-300 text-primary-600 focus:ring-primary-500/20 transition-colors"
                                        />
                                        <div>
                                            <span className="text-sm font-semibold text-surface-700 group-hover:text-primary-600 transition-colors">
                                                🌐 Interpreter Needed
                                            </span>
                                            <p className="text-xs text-surface-400">Request an interpreter for your visit</p>
                                        </div>
                                    </label>

                                    {formData.interpreter_needed && (
                                        <div className="mt-3 animate-slide-up">
                                            <label className="label-text" htmlFor="interpreter_language">Language *</label>
                                            <select
                                                name="interpreter_language"
                                                id="interpreter_language"
                                                value={formData.interpreter_language}
                                                onChange={handleInputChange}
                                                className={`input-field ${formErrors.interpreter_language ? 'border-red-400' : ''}`}
                                            >
                                                <option value="">Select language...</option>
                                                <option value="Spanish">Spanish</option>
                                                <option value="Mandarin">Mandarin</option>
                                                <option value="Arabic">Arabic</option>
                                                <option value="French">French</option>
                                                <option value="Vietnamese">Vietnamese</option>
                                                <option value="Korean">Korean</option>
                                                <option value="Portuguese">Portuguese</option>
                                                <option value="Russian">Russian</option>
                                                <option value="Haitian Creole">Haitian Creole</option>
                                                <option value="ASL">American Sign Language (ASL)</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {formErrors.interpreter_language && <p className="text-red-500 text-xs mt-1">{formErrors.interpreter_language}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6" id="patient-info-section">
                            <h2 className="text-lg font-display font-bold text-surface-900 mb-4">Patient Information</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label-text" htmlFor="patient_first_name">First Name *</label>
                                        <input
                                            type="text"
                                            name="patient_first_name"
                                            id="patient_first_name"
                                            value={formData.patient_first_name}
                                            onChange={handleInputChange}
                                            placeholder="John"
                                            className={`input-field ${formErrors.patient_first_name ? 'border-red-400' : ''}`}
                                        />
                                        {formErrors.patient_first_name && <p className="text-red-500 text-xs mt-1">{formErrors.patient_first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="label-text" htmlFor="patient_last_name">Last Name *</label>
                                        <input
                                            type="text"
                                            name="patient_last_name"
                                            id="patient_last_name"
                                            value={formData.patient_last_name}
                                            onChange={handleInputChange}
                                            placeholder="Doe"
                                            className={`input-field ${formErrors.patient_last_name ? 'border-red-400' : ''}`}
                                        />
                                        {formErrors.patient_last_name && <p className="text-red-500 text-xs mt-1">{formErrors.patient_last_name}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="label-text" htmlFor="patient_email">Email *</label>
                                    <input
                                        type="email"
                                        name="patient_email"
                                        id="patient_email"
                                        value={formData.patient_email}
                                        onChange={handleInputChange}
                                        placeholder="john.doe@email.com"
                                        className={`input-field ${formErrors.patient_email ? 'border-red-400' : ''}`}
                                    />
                                    {formErrors.patient_email && <p className="text-red-500 text-xs mt-1">{formErrors.patient_email}</p>}
                                </div>

                                <div>
                                    <label className="label-text" htmlFor="patient_phone">Phone *</label>
                                    <input
                                        type="tel"
                                        name="patient_phone"
                                        id="patient_phone"
                                        value={formData.patient_phone}
                                        onChange={handleInputChange}
                                        placeholder="(555) 123-4567"
                                        className={`input-field ${formErrors.patient_phone ? 'border-red-400' : ''}`}
                                    />
                                    {formErrors.patient_phone && <p className="text-red-500 text-xs mt-1">{formErrors.patient_phone}</p>}
                                </div>

                                <div>
                                    <label className="label-text" htmlFor="patient_dob">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="patient_dob"
                                        id="patient_dob"
                                        value={formData.patient_dob}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="label-text" htmlFor="notification_preference">Notification Preference</label>
                                    <select
                                        name="notification_preference"
                                        id="notification_preference"
                                        value={formData.notification_preference}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="email">Email</option>
                                        <option value="sms">Text Message (SMS)</option>
                                        <option value="both">Both Email & Text</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Submit */}
                        {selectedDate && selectedTime && (
                            <div className="bg-primary-50 rounded-2xl border-2 border-primary-200 p-6 animate-slide-up" id="booking-summary">
                                <h2 className="text-lg font-display font-bold text-primary-800 mb-3">Booking Summary</h2>
                                <div className="space-y-2 text-sm">
                                    <p className="flex justify-between">
                                        <span className="text-primary-600">Provider:</span>
                                        <span className="font-semibold text-primary-800">Dr. {provider.last_name}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-primary-600">Date:</span>
                                        <span className="font-semibold text-primary-800">
                                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-primary-600">Time:</span>
                                        <span className="font-semibold text-primary-800">{formatTime(selectedTime)}</span>
                                    </p>
                                    {formData.appointment_type_id && (
                                        <p className="flex justify-between">
                                            <span className="text-primary-600">Type:</span>
                                            <span className="font-semibold text-primary-800">
                                                {appointmentTypes.find(t => t.id === parseInt(formData.appointment_type_id))?.name}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full btn-primary text-lg !py-4"
                            id="submit-booking-btn"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Booking...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Confirm Booking
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={handleConfirmationClose}
                appointment={confirmedAppointment}
            />
        </div>
    )
}
