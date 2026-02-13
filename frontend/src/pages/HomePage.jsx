import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAISuggestions } from '../services/api'

export default function HomePage() {
    const navigate = useNavigate()
    const [aiInput, setAiInput] = useState('')
    const [aiResults, setAiResults] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)

    const handleAiSubmit = async (e) => {
        e.preventDefault()
        if (!aiInput.trim()) return

        setAiLoading(true)
        try {
            const results = await getAISuggestions(aiInput)
            setAiResults(results)
        } catch (err) {
            console.error('AI suggestion error:', err)
        } finally {
            setAiLoading(false)
        }
    }

    const features = [
        {
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            ),
            title: 'Find Providers',
            desc: 'Search from our network of trusted healthcare providers by specialty, location, or name.',
            color: 'from-primary-500 to-teal-400'
        },
        {
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
            ),
            title: 'Book Instantly',
            desc: 'View real-time availability and book appointments in seconds — no phone calls needed.',
            color: 'from-accent-500 to-purple-400'
        },
        {
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
            ),
            title: 'AI-Powered',
            desc: 'Our AI assistant helps you find the right appointment type based on your symptoms.',
            color: 'from-amber-500 to-orange-400'
        },
        {
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
            ),
            title: 'Manage Easily',
            desc: 'View, reschedule, or cancel your appointments anytime from your personal portal.',
            color: 'from-emerald-500 to-green-400'
        }
    ]

    const stats = [
        { value: '8+', label: 'Providers' },
        { value: '10+', label: 'Specialties' },
        { value: '90', label: 'Days Availability' },
        { value: '24/7', label: 'Online Booking' },
    ]

    return (
        <div>
            {/* Hero Section */}
            <section className="gradient-hero text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 -left-20 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6 animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            AI-Powered Healthcare Scheduling
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6 animate-slide-up">
                            Book Your Healthcare
                            <br />
                            Appointments with
                            <br />
                            <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
                                Intelligence
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 leading-relaxed animate-slide-up animate-stagger-1">
                            Skip the phone calls. CareBook AI lets you search providers, view available slots, and book appointments instantly — all powered by smart scheduling AI.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animate-stagger-2">
                            <Link
                                to="/providers"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-800 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                id="hero-find-provider"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                                Find a Provider
                            </Link>
                            <Link
                                to="/appointments"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-lg hover:bg-white/20 transition-all duration-200"
                                id="hero-my-appointments"
                            >
                                My Appointments →
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up animate-stagger-3">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                                <p className="text-3xl font-display font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-white/60 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Assistant Section */}
            <section className="py-16 md:py-20 bg-white" id="ai-assistant-section">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <span className="badge-primary mb-3 inline-block">✨ AI Powered</span>
                        <h2 className="section-title mb-3">Not sure what appointment to book?</h2>
                        <p className="text-surface-500 text-lg">Describe your symptoms and our AI will suggest the right appointment type for you.</p>
                    </div>

                    <form onSubmit={handleAiSubmit} className="relative">
                        <div className="bg-surface-50 rounded-2xl p-6 border-2 border-surface-200 focus-within:border-primary-400 transition-colors duration-200">
                            <textarea
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="e.g., I've been having headaches and dizziness for the past week..."
                                className="w-full bg-transparent text-surface-800 placeholder-surface-400 resize-none outline-none text-lg leading-relaxed"
                                rows={3}
                                maxLength={1000}
                                id="ai-input"
                            />
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-surface-400">{aiInput.length}/1000</span>
                                <button
                                    type="submit"
                                    disabled={!aiInput.trim() || aiLoading}
                                    className="btn-primary !px-8"
                                    id="ai-submit-btn"
                                >
                                    {aiLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Analyzing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                            </svg>
                                            Get AI Suggestions
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* AI Results */}
                    {aiResults && (
                        <div className="mt-8 animate-slide-up" id="ai-results">
                            <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-2xl p-6 border border-primary-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg">🤖</span>
                                    <h3 className="font-display font-bold text-surface-800">AI Recommendations</h3>
                                </div>
                                <p className="text-surface-600 text-sm mb-4">{aiResults.message}</p>

                                {aiResults.suggestions && aiResults.suggestions.length > 0 && (
                                    <div className="space-y-3 mb-4">
                                        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Suggested Appointment Types</p>
                                        {aiResults.suggestions.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-surface-400'}`}>
                                                        {i + 1}
                                                    </div>
                                                    <span className="font-semibold text-surface-800">{s.appointment_type}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="w-20 h-2 bg-surface-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.round(s.confidence * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-surface-400 mt-0.5">{Math.round(s.confidence * 100)}% match</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {aiResults.specialties && aiResults.specialties.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Recommended Specialties</p>
                                        <div className="flex flex-wrap gap-2">
                                            {aiResults.specialties.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => navigate(`/providers?specialty=${encodeURIComponent(s.specialty)}`)}
                                                    className="badge-info cursor-pointer hover:bg-blue-200 transition-colors"
                                                >
                                                    {s.specialty} ({Math.round(s.confidence * 100)}%)
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-surface-400 italic mt-3">{aiResults.disclaimer}</p>

                                <div className="mt-4">
                                    <Link to="/providers" className="btn-primary text-sm" id="ai-find-provider-btn">
                                        Find a Provider →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-20" id="features-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="section-title mb-3">How CareBook AI Works</h2>
                        <p className="text-surface-500 text-lg max-w-2xl mx-auto">
                            A smarter way to manage your healthcare. No more long hold times or phone tag.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-6 shadow-card card-hover border border-surface-100"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-display font-bold text-surface-900 mb-2">{feature.title}</h3>
                                <p className="text-surface-500 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-20 bg-gradient-to-r from-primary-700 via-primary-600 to-teal-500">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        Ready to book your appointment?
                    </h2>
                    <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of patients who have simplified their healthcare experience with CareBook AI.
                    </p>
                    <Link
                        to="/providers"
                        className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-primary-800 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        id="cta-get-started"
                    >
                        Get Started — It's Free
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    )
}
