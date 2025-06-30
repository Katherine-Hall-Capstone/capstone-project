import { useState } from 'react'
import ClientSearchForm from '../DashComponents/ClientSearchForm'
import ClientAppointments from '../DashComponents/ClientAppointments'
import ClientReviews from '../DashComponents/ClientReviews'

function ClientDashPage() {
    const [activeTab, setActiveTab] = useState('appointments')
    
    return(
        <>
            <nav>
                <button onClick={() => setActiveTab('search')}>Search</button>
                <button onClick={() => setActiveTab('appointments')}>Upcoming Appointments</button>
                <button onClick={() => setActiveTab('reviews')}>My Reviews</button>
            </nav>

            {activeTab === 'search' && <ClientSearchForm />}
            {activeTab === 'appointments' && <ClientAppointments />}
            {activeTab === 'reviews' && <ClientReviews />}
        </>
    )
}

export default ClientDashPage