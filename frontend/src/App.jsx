import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SearchProviders from './pages/SearchProviders'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import AppointmentDetails from './pages/AppointmentDetails'
import AssistantPanel from './components/assistant/AssistantPanel'
import { AssistantProvider } from './context/AssistantContext'

function App() {
    return (
        <Router>
            <AssistantProvider>
                <div className="flex flex-col min-h-screen bg-surface-50">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/providers" element={<SearchProviders />} />
                            <Route path="/book/:providerId" element={<BookAppointment />} />
                            <Route path="/appointments" element={<MyAppointments />} />
                            <Route path="/appointments/:id" element={<AppointmentDetails />} />
                        </Routes>
                    </main>
                    <Footer />
                    <AssistantPanel />
                </div>
            </AssistantProvider>
        </Router>
    )
}

export default App
