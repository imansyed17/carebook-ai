import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login, mockMembers, member } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Redirect to where they came from or home if already logged in
    if (member) {
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
        return null
    }

    const handleLogin = (memberId) => {
        login(memberId)
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-display font-bold text-surface-900">Member Login</h1>
                <p className="mt-2 text-surface-600">Select a demo profile to continue to your member portal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockMembers.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 hover:shadow-md hover:border-primary-300 transition-all">
                        <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                            {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold text-surface-800">{m.firstName} {m.lastName}</h3>
                        
                        <div className="mt-4 space-y-2 text-sm text-surface-600">
                            <p><span className="font-semibold text-surface-500">Plan:</span> {m.planName}</p>
                            <p><span className="font-semibold text-surface-500">Network:</span> {m.planNetwork}</p>
                            <p><span className="font-semibold text-surface-500">PCP:</span> {m.pcpName || 'None assigned'}</p>
                            {m.interpreterNeeded && (
                                <p><span className="font-semibold text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded">Needs {m.interpreterLanguage} Interpreter</span></p>
                            )}
                        </div>

                        <button
                            onClick={() => handleLogin(m.id)}
                            className="mt-6 w-full py-2.5 bg-primary-50 text-primary-700 font-semibold rounded-xl border border-primary-200 hover:bg-primary-600 hover:text-white transition-colors"
                        >
                            Log In as {m.firstName}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 text-center text-sm text-surface-500">
                <p>This is a demo secure environment. No real health information is stored or transmitted.</p>
            </div>
        </div>
    )
}
