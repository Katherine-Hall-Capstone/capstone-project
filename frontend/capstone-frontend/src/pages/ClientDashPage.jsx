import { useState, useEffect } from 'react'
import { useLogout } from '../hooks/useLogout'
import { useRefreshUser } from '../hooks/useRefreshUser'
import { useUser } from '../UserContext'
import ClientSearchForm from '../DashComponents/ClientSearchForm'
import ClientAppointments from '../DashComponents/ClientAppointments'
import ClientReviews from '../DashComponents/ClientReviews'
import CalendarStatus from '../DashComponents/CalendarStatus'
import ClientPreferences from '../DashComponents/ClientPreferences'

function ClientDashPage() {
    const { user } = useUser()
    const logout = useLogout()
    const [activeTab, setActiveTab] = useState('appointments')
    const refreshUser = useRefreshUser()

    useEffect(() => {
        refreshUser()
    }, [])

    return(
        <div>
            <div className="header-bar">
                <p>[Logo]</p>

                <nav>
                    <button onClick={() => setActiveTab('search')}>Search</button>
                    <button onClick={() => setActiveTab('appointments')}>Upcoming Appointments</button>
                    <button onClick={() => setActiveTab('reviews')}>My Reviews</button>
                    <button onClick={() => setActiveTab('preferences')}>My Preferences</button>
                </nav>

                <button onClick={logout}>Logout</button>
            </div>
            
            <CalendarStatus googleConnected={user.googleConnected} />

            {activeTab === 'search' && <ClientSearchForm />}
            {activeTab === 'appointments' && <ClientAppointments />}
            {activeTab === 'reviews' && <ClientReviews />}
            {activeTab === 'preferences' && <ClientPreferences />}
        </div>
    )
}

export default ClientDashPage