import { useState } from 'react'
import { useLogout } from '../hooks/useLogout'
import ClientSearchForm from '../DashComponents/ClientSearchForm'
import ClientAppointments from '../DashComponents/ClientAppointments'
import ClientReviews from '../DashComponents/ClientReviews'

function ClientDashPage() {
    const logout = useLogout()
    const [activeTab, setActiveTab] = useState('appointments')

    return(
        <div>
            <button onClick={logout}>Logout</button>

            <nav>
                <button onClick={() => setActiveTab('search')}>Search</button>
                <button onClick={() => setActiveTab('appointments')}>Upcoming Appointments</button>
                <button onClick={() => setActiveTab('reviews')}>My Reviews</button>
            </nav>

            {activeTab === 'search' && <ClientSearchForm />}
            {activeTab === 'appointments' && <ClientAppointments />}
            {activeTab === 'reviews' && <ClientReviews />}
        </div>
    )
}

export default ClientDashPage