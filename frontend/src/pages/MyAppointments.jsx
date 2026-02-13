import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAppointments } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function MyAppointments() {
    const [searchType, setSearchType] = useState('email')
    const [searchValue, setSearchValue] = useState('')
    const [appointments, setAppointments] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchValue.trim()) return

        setLoading(true)
        setError(null)
        setSearched(true)

        try {
            const params = searchType === 'email'
                ? { email: searchValue.trim() }
                : { confirmation_number: searchValue.trim().toUpperCase() }

            const data = await getAppointments(params)
            setAppointments(data.appointments)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    }

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12}:${minutes} ${ampm}`
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="badge-success">✓ Confirmed</span>
            case 'rescheduled':
                return <span className="badge-info">↻ Rescheduled</span>
            case 'cancelled':
                return <span className="badge-danger">✕ Cancelled</span>
            default:
                return <span className="badge-primary">{status}</span>
        }
    }

    const isUpcoming = (dateStr) => {
        const apptDate = new Date(dateStr + 'T00:00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return apptDate >= today
    }

    return (
        <div className="page-container animate-fade-in">
            <div className="mb-8">
                <h1 className="section-title mb-2" id="my-appointments-title">My Appointments</h1>
                <p className="text-surface-500 text-lg">Look up your appointments by email or confirmation number.</p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6 mb-8" id="appointment-search">
                <form onSubmit={handleSearch}>
                    {/* Toggle */}
                    <div className="flex bg-surface-100 rounded-xl p-1 mb-4 w-fit">
                        <button
                            type="button"
                            onClick={() => { setSearchType('email'); setSearchValue(''); setAppointments(null); setSearched(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${searchType === 'email' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                                }`}
                        >
                            By Email
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSearchType('confirmation'); setSearchValue(''); setAppointments(null); setSearched(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${searchType === 'confirmation' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                                }`}
                        >
                            By Confirmation #
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type={searchType === 'email' ? 'email' : 'text'}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder={searchType === 'email' ? 'Enter your email address' : 'Enter confirmation number (e.g., CB-A1B2C3D4)'}
                            className="input-field flex-1"
                            id="appointment-search-input"
                            required
                        />
                        <button type="submit" className="btn-primary" id="appointment-search-btn" disabled={loading}>
                            {loading ? 'Searching...' : 'Look Up'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <LoadingSpinner text="Searching appointments..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={handleSearch} />
            ) : searched && appointments && appointments.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-700 mb-2">No appointments found</h3>
                    <p className="text-surface-500 text-sm mb-6">We couldn't find any appointments matching your search.</p>
                    <Link to="/providers" className="btn-primary text-sm">
                        Book Your First Appointment
                    </Link>
                </div>
            ) : appointments && appointments.length > 0 ? (
                <div>
                    <p className="text-sm text-surface-500 mb-4">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>
                    <div className="space-y-4">
                        {appointments.map((apt) => (
                            <Link
                                key={apt.id}
                                to={`/appointments/${apt.id}`}
                                className="block bg-white rounded-2xl shadow-card border border-surface-100 p-6 card-hover"
                                id={`appointment-card-${apt.id}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusBadge(apt.status)}
                                            {isUpcoming(apt.appointment_date) && apt.status !== 'cancelled' && (
                                                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    Upcoming
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-display font-bold text-surface-900 mb-1">
                                            {apt.provider_name}
                                        </h3>
                                        <p className="text-primary-600 text-sm font-medium mb-2">{apt.appointment_type_name}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                                </svg>
                                                {formatDate(apt.appointment_date)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                                {formatTime(apt.appointment_time)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                                </svg>
                                                {apt.provider_location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-surface-400 font-medium">Confirmation</p>
                                            <p className="text-sm font-bold text-surface-700 font-mono">{apt.confirmation_number}</p>
                                        </div>
                                        <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
