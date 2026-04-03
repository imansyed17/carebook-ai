import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login, member } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // Redirect to where they came from or home if already logged in
    if (member) {
        const from = location.state?.from?.pathname || '/appointments'
        navigate(from, { replace: true })
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const result = await login(email, password)
            if (result.success) {
                const from = location.state?.from?.pathname || '/appointments'
                navigate(from, { replace: true })
            } else {
                setError(result.error || 'Authentication failed. Please check your credentials.')
            }
        } catch (err) {
            setError('An error occurred during login. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-display font-bold text-surface-900">Member Portal</h1>
                <p className="mt-2 text-surface-600">Sign in to manage your appointments and plan details</p>
            </div>

            <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field w-full"
                            placeholder="member@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field w-full"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3.5 text-base flex justify-center items-center"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Signing In...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>

            <div className="mt-8 bg-surface-50 border border-surface-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-surface-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    Demo Member Accounts
                </h3>
                <div className="space-y-4">
                    <div className="text-sm">
                        <p className="font-semibold text-surface-700">Sarah Jenkins (BlueCare PPO)</p>
                        <p className="text-surface-500 font-mono mt-0.5">sarah.jenkins@example.com / password123</p>
                    </div>
                    <div className="h-px w-full bg-surface-200"></div>
                    <div className="text-sm">
                        <p className="font-semibold text-surface-700">Michael Rodriguez (Aetna HMO)</p>
                        <p className="text-surface-500 font-mono mt-0.5">m.rodriguez@example.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
