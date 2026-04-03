import { createContext, useContext, useState, useEffect } from 'react'
import { loginMember } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [member, setMember] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedMember = sessionStorage.getItem('carebook_auth_member')
        if (storedMember) {
            try {
                setMember(JSON.parse(storedMember))
            } catch (e) {
                sessionStorage.removeItem('carebook_auth_member')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const data = await loginMember(email, password)
            if (data.member) {
                setMember(data.member)
                sessionStorage.setItem('carebook_auth_member', JSON.stringify(data.member))
                return { success: true }
            }
            return { success: false, error: 'Authentication failed' }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = () => {
        setMember(null)
        sessionStorage.removeItem('carebook_auth_member')
    }

    return (
        <AuthContext.Provider value={{ member, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
