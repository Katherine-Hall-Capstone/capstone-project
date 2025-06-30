import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useUser } from '../UserContext'
import ClientSearchForm from '../DashComponents/ClientSearchForm'
import ClientAppointments from '../DashComponents/ClientAppointments'
import ClientReviews from '../DashComponents/ClientReviews'

function ClientDashPage() {
    const navigate = useNavigate()
    const { setUser } = useUser()
    const [activeTab, setActiveTab] = useState('appointments')

    async function handleLogout() {
        try {
            const res = await fetch('http://localhost:3000/auth/logout', {
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
        <div>
            <button onClick={handleLogout}>Logout</button>

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