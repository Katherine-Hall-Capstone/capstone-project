import '../css/ProviderDashPage.css'
import { useState } from 'react'
import { useLogout } from '../hooks/useLogout'
import { useUser } from '../UserContext'
import ProviderAvailability from '../DashComponents/ProviderAvailability'
import ProviderAppointments from '../DashComponents/ProviderAppointments'
import ProviderReviews from '../DashComponents/ProviderReviews'
import CalendarStatus from '../DashComponents/CalendarStatus'

function ProviderDashPage() {
    const user = useUser()
    const logout = useLogout()
    const [activeTab, setActiveTab] = useState('appointments')

    return(
        <div>  
            <div className="header-bar">
                <p>[Logo]</p>

                <nav>
                    <button onClick={() => setActiveTab('availability')}>Set Availability</button>
                    <button onClick={() => setActiveTab('appointments')}>Upcoming Appointments</button>
                    <button onClick={() => setActiveTab('reviews')}>My Reviews</button>
                </nav>

                <button onClick={logout}>Logout</button>
            </div>

            <CalendarStatus googleConnected={user.googleConnected} />

            {activeTab === 'availability' && <ProviderAvailability />}
            {activeTab === 'appointments' && <ProviderAppointments />}
            {activeTab === 'reviews' && <ProviderReviews />}
        </div>
    )
}

export default ProviderDashPage