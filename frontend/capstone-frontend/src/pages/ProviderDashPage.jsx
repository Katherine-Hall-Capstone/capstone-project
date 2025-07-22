import { useState, useEffect } from 'react'
import { useLogout } from '../hooks/useLogout'
import ProviderAvailability from '../DashComponents/ProviderAvailability'
import ProviderAppointments from '../DashComponents/ProviderAppointments'
import ProviderReviews from '../DashComponents/ProviderReviews'
import CalendarStatus from '../DashComponents/CalendarStatus'

function ProviderDashPage() {
    const logout = useLogout()
    const [activeTab, setActiveTab] = useState('appointments')

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

            {activeTab === 'details' && <ProviderAvailability />}
            {activeTab === 'appointments' && <ProviderAppointments />}
            {activeTab === 'reviews' && <ProviderReviews />}
        </div>
    )
}

export default ProviderDashPage