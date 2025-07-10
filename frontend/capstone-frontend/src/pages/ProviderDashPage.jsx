import '../css/ProviderDashPage.css'
import { useState, useEffect } from 'react'
import { useLogout } from '../hooks/useLogout'
import { useRefreshUser } from '../hooks/useRefreshUser'
import { useUser } from '../UserContext'
import ProviderAvailability from '../DashComponents/ProviderAvailability'
import ProviderAppointments from '../DashComponents/ProviderAppointments'
import ProviderReviews from '../DashComponents/ProviderReviews'
import CalendarStatus from '../DashComponents/CalendarStatus'

function ProviderDashPage() {
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
                    <button onClick={() => setActiveTab('details')}>My Service Details</button>
                    <button onClick={() => setActiveTab('appointments')}>Upcoming Appointments</button>
                    <button onClick={() => setActiveTab('reviews')}>My Reviews</button>
                </nav>

                <button onClick={logout}>Logout</button>
            </div>

            <CalendarStatus googleConnected={user.googleConnected} />

            {activeTab === 'details' && <ProviderAvailability />}
            {activeTab === 'appointments' && <ProviderAppointments />}
            {activeTab === 'reviews' && <ProviderReviews />}
        </div>
    )
}

export default ProviderDashPage