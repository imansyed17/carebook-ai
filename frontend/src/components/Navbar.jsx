import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAssistant } from '../context/AssistantContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { togglePanel, isPanelOpen } = useAssistant()
    const { member, logout } = useAuth()

    const links = [
        { to: '/', label: 'Home', id: 'nav-home' },
        { to: '/providers', label: 'Find Providers', id: 'nav-providers' }
    ]
    
    if (member) {
        links.push({ to: '/appointments', label: 'My Appointments', id: 'nav-appointments' })
    }

    const isActive = (path) => location.pathname === path
    
    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-18">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group" id="nav-logo">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xl font-display font-bold text-surface-900">
                                Care<span className="text-gradient">Book</span>
                            </span>
                            <span className="ml-1 text-xs font-semibold text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded-md">
                                AI
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                id={link.id}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-surface-600 hover:text-primary-700 hover:bg-surface-100'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        {member ? (
                            <div className="flex items-center gap-3 mr-2">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-surface-800">{member.firstName} {member.lastName}</p>
                                    <p className="text-[10px] text-surface-500">{member.planName}</p>
                                </div>
                                <button onClick={handleLogout} className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                                    Logout
                                </button>
                                <div className="h-6 w-px bg-surface-200 mx-1"></div>
                            </div>
                        ) : (
                            <Link to="/login" className="text-sm font-semibold text-surface-600 hover:text-primary-700 transition-colors mr-2">
                                Member Login
                            </Link>
                        )}
                        <button
                            onClick={togglePanel}
                            id="nav-ai-assistant"
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isPanelOpen
                                ? 'bg-primary-100 text-primary-700 shadow-sm'
                                : 'bg-surface-100 text-surface-600 hover:bg-primary-50 hover:text-primary-700'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                            </svg>
                            AI Assistant
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors"
                        id="nav-mobile-toggle"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 animate-slide-up border-t border-surface-100 mt-2 pt-2">
                        {member && (
                            <div className="px-4 py-3 mb-2 bg-surface-50 rounded-lg">
                                <p className="text-sm font-bold text-surface-800">{member.firstName} {member.lastName}</p>
                                <p className="text-xs text-surface-500">{member.planName}</p>
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    id={`${link.id}-mobile`}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-surface-600 hover:bg-surface-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {member ? (
                                <button
                                    onClick={() => { setIsOpen(false); handleLogout(); }}
                                    className="text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors"
                                >
                                    Member Login
                                </Link>
                            )}
                            <Link
                                to="/providers"
                                onClick={() => setIsOpen(false)}
                                className="mt-2 px-4 py-3 rounded-xl gradient-primary text-white text-sm font-semibold text-center shadow-md"
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
