import { useState } from 'react'
import { useLogout } from '../hooks/useLogout'
import ClientSearchForm from '../DashComponents/ClientSearchForm'
import ClientAppointments from '../DashComponents/ClientAppointments'
import ClientReviews from '../DashComponents/ClientReviews'
import ClientPreferences from '../DashComponents/ClientPreferences'

function ClientDashPage() {
    const logout = useLogout()
    const [activeTab, setActiveTab] = useState('appointments')

    return(
        <div>
            <div className="flex flex-row items-center justify-between mt-2 px-10 py-2">
                <p className="text-xl font-bold text-slate-900">EasyPoint</p>

                <nav className="flex items-center gap-1 bg-gray-100 rounded-full px-1 py-1">
                    <button 
                        onClick={() => setActiveTab('search')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'search' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        Search
                    </button>

                    <button 
                        onClick={() => setActiveTab('appointments')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'appointments' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        Upcoming Appointments
                    </button>

                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'reviews' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        My Reviews
                    </button>

                    <button 
                        onClick={() => setActiveTab('preferences')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'preferences' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        My Preferences
                    </button>
                </nav>

                <button 
                    onClick={logout}
                    className="bg-slate-900 hover:bg-slate-600 transition duration-200 text-white font-semibold py-2 px-5 rounded-md cursor-pointer"
                >
                    Logout
                </button>
            </div>
            
            {activeTab === 'search' && <ClientSearchForm />}
            {activeTab === 'appointments' && <ClientAppointments />}
            {activeTab === 'reviews' && <ClientReviews />}
            {activeTab === 'preferences' && <ClientPreferences />}
        </div>
    )
}

export default ClientDashPage