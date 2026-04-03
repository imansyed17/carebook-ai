import { createContext, useContext, useState, useEffect } from 'react'

const mockMembers = [
    {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '555-0102',
        dob: '1985-04-12',
        memberId: 'CB-982374-1',
        insuranceId: 'BCBS-TX-9988',
        groupNumber: 'GRP-1029',
        planName: 'BlueCare Gold PPO',
        planNetwork: 'PPO',
        pcpName: 'Dr. Emily Chen',
        pcpId: 1, // Assuming Dr. Emily Chen has ID 1 in our DB
        address: '1423 Willow Ave',
        zip: '75248',
        city: 'Dallas',
        state: 'TX',
        communicationPreference: 'text',
        interpreterNeeded: false,
        interpreterLanguage: null
    },
    {
        id: '2',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'm.rodriguez@example.com',
        phone: '555-8821',
        dob: '1992-11-05',
        memberId: 'CB-445521-2',
        insuranceId: 'AET-HMO-445',
        groupNumber: 'GRP-5561',
        planName: 'Aetna Value HMO',
        planNetwork: 'HMO',
        pcpName: null,
        pcpId: null,
        address: '8812 Oak Street, Apt 4B',
        zip: '75001',
        city: 'Addison',
        state: 'TX',
        communicationPreference: 'email',
        interpreterNeeded: true,
        interpreterLanguage: 'Spanish'
    },
    {
        id: '3',
        firstName: 'James',
        lastName: 'Smith',
        email: 'jsmith.demo@example.com',
        phone: '555-0099',
        dob: '1960-08-22',
        memberId: 'CB-112233-0',
        insuranceId: 'MED-ADV-77',
        groupNumber: 'GRP-900',
        planName: 'Medicare Advantage Plus',
        planNetwork: 'Medicare',
        pcpName: 'Dr. Robert Kim',
        pcpId: 3,
        address: '445 Pine Road',
        zip: '75230',
        city: 'Dallas',
        state: 'TX',
        communicationPreference: 'both',
        interpreterNeeded: false,
        interpreterLanguage: null
    }
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [member, setMember] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedMemberId = sessionStorage.getItem('carebook_auth_id')
        if (storedMemberId) {
            const found = mockMembers.find(m => m.id === storedMemberId)
            if (found) setMember(found)
        }
        setIsLoading(false)
    }, [])

    const login = (memberId) => {
        const found = mockMembers.find(m => m.id === memberId)
        if (found) {
            setMember(found)
            sessionStorage.setItem('carebook_auth_id', memberId)
            return true
        }
        return false
    }

    const logout = () => {
        setMember(null)
        sessionStorage.removeItem('carebook_auth_id')
    }

    return (
        <AuthContext.Provider value={{ member, login, logout, isLoading, mockMembers }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
