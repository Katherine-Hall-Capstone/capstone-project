import '../css/ProviderDashPage.css'
import { useState } from 'react'
import { useLogout } from '../hooks/useLogout'
import ProviderAvailability from '../DashComponents/ProviderAvailability'
import ProviderAppointments from '../DashComponents/ProviderAppointments'
import ProviderReviews from '../DashComponents/ProviderReviews'

function ProviderDashPage() {
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

            {activeTab === 'availability' && <ProviderAvailability />}
            {activeTab === 'appointments' && <ProviderAppointments />}
            {activeTab === 'reviews' && <ProviderReviews />}
        </div>
    )
}

export default ProviderDashPage