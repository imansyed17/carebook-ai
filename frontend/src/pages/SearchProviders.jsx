import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProviders, getSpecialties } from '../services/api'
import ProviderCard from '../components/ProviderCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function SearchProviders() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [providers, setProviders] = useState([])
    const [specialties, setSpecialties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '')

    useEffect(() => {
        loadSpecialties()
    }, [])

    useEffect(() => {
        loadProviders()
    }, [searchParams])

    const loadSpecialties = async () => {
        try {
            const data = await getSpecialties()
            setSpecialties(data)
        } catch (err) {
            console.error('Failed to load specialties:', err)
        }
    }

    const loadProviders = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = {}
            const q = searchParams.get('q')
            const specialty = searchParams.get('specialty')
            if (q) params.q = q
            if (specialty) params.specialty = specialty

            const data = await getProviders(params)
            setProviders(data.providers)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const params = {}
        if (searchQuery.trim()) params.q = searchQuery.trim()
        if (selectedSpecialty) params.specialty = selectedSpecialty
        setSearchParams(params)
    }

    const handleSpecialtyChange = (specialty) => {
        setSelectedSpecialty(specialty)
        const params = {}
        if (searchQuery.trim()) params.q = searchQuery.trim()
        if (specialty) params.specialty = specialty
        setSearchParams(params)
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedSpecialty('')
        setSearchParams({})
    }

    return (
        <div className="page-container animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="section-title mb-2" id="providers-title">Find a Provider</h1>
                <p className="text-surface-500 text-lg">Search our network of trusted healthcare professionals.</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6 mb-8" id="search-filters">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, specialty, or location..."
                            className="input-field !pl-12"
                            id="provider-search-input"
                        />
                    </div>

                    {/* Specialty Filter */}
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => handleSpecialtyChange(e.target.value)}
                        className="input-field md:w-56"
                        id="specialty-filter"
                    >
                        <option value="">All Specialties</option>
                        {specialties.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <button type="submit" className="btn-primary" id="search-btn">
                        Search
                    </button>
                </form>

                {/* Active Filters */}
                {(searchParams.get('q') || searchParams.get('specialty')) && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-100">
                        <span className="text-xs font-medium text-surface-500">Active filters:</span>
                        {searchParams.get('q') && (
                            <span className="badge-primary">
                                "{searchParams.get('q')}"
                            </span>
                        )}
                        {searchParams.get('specialty') && (
                            <span className="badge-info">
                                {searchParams.get('specialty')}
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-xs text-red-500 hover:text-red-600 font-medium ml-2"
                            id="clear-filters-btn"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Results */}
            {loading ? (
                <LoadingSpinner text="Searching providers..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={loadProviders} />
            ) : providers.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-700 mb-2">No providers found</h3>
                    <p className="text-surface-500 text-sm mb-4">Try adjusting your search or filters.</p>
                    <button onClick={clearFilters} className="btn-secondary text-sm">
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-surface-500 mb-4">{providers.length} provider{providers.length !== 1 ? 's' : ''} found</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {providers.map((provider) => (
                            <ProviderCard key={provider.id} provider={provider} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
