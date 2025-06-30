import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useUser } from '../UserContext'
import ProviderAvailability from '../DashComponents/ProviderAvailability'
import ProviderAppointments from '../DashComponents/ProviderAppointments'
import ProviderReviews from '../DashComponents/ProviderReviews'

function ProviderDashPage() {
    const navigate = useNavigate()
    const { setUser } = useUser()
    const [activeTab, setActiveTab] = useState('appointments')

    async function handleLogout() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })

            if(res.ok) {
                setUser(null)
                navigate('/')
            } else {
                console.error('Logout failed')
            }
        } catch(error) {
            console.error(error)
        }
    }


    return(
        <>  
            <button onClick={handleLogout}>Logout</button>

            <nav>
                <button onClick={() => setActiveTab('availability')}>Set Availability</button>
                <button onClick={() => setActiveTab('appointments')}>Upcoming Appointments</button>
                <button onClick={() => setActiveTab('reviews')}>My Reviews</button>
            </nav>

            {activeTab === 'availability' && <ProviderAvailability />}
            {activeTab === 'appointments' && <ProviderAppointments />}
            {activeTab === 'reviews' && <ProviderReviews />}
        </>
    )
}

export default ProviderDashPage