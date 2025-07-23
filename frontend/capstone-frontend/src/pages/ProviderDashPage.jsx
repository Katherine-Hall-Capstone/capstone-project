import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLogout } from '../hooks/useLogout'
import ProviderAvailability from '../DashComponents/ProviderAvailability'
import ProviderAppointments from '../DashComponents/ProviderAppointments'
import ProviderReviews from '../DashComponents/ProviderReviews'
import { SLIDE_DISTANCE, SLIDE_DURATION } from '../constants'

function ProviderDashPage() {
    const logout = useLogout()
    const [activeTab, setActiveTab] = useState('appointments')
    const [direction, setDirection] = useState(1)
    const tabs = ['details', 'appointments', 'reviews']

    function changeTab(newTab) {
        if (newTab === activeTab) {
            return
        }

        tabs.indexOf(newTab) > tabs.indexOf(activeTab) ? setDirection(1) : setDirection(-1)
        setActiveTab(newTab)
    }

    return(
        <div>  
            <div className="flex flex-row items-center justify-between mt-2 px-10 py-2">
                <p className="text-xl text-slate-900 font-bold">EasyPoint</p>

                <nav className="flex items-center gap-1 px-1 py-1 bg-gray-100 rounded-full">
                    <button 
                        onClick={() => changeTab('details')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'details' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        My Service Details
                    </button>

                    <button 
                        onClick={() => changeTab('appointments')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'appointments' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        Upcoming Appointments
                    </button>

                    <button 
                        onClick={() => changeTab('reviews')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'reviews' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        My Reviews
                    </button>
                </nav>

                <button 
                    onClick={logout}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-600 transition duration-200 text-white font-semibold rounded-md cursor-pointer"
                >
                    Logout
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                    <motion.div
                        key="details"
                        initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        transition={{ duration: SLIDE_DURATION }}
                    >
                        <ProviderAvailability />
                    </motion.div>
                )}

                {activeTab === 'appointments' && (
                    <motion.div
                        key="appointments"
                        initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -SLIDE_DISTANCE, opacity: 0 }}
                        transition={{ duration: SLIDE_DURATION }}
                    >
                        <ProviderAppointments />
                    </motion.div>
                )}

                {activeTab === 'reviews' && (
                    <motion.div
                        key="ProviderAppointments"
                        initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        transition={{ duration: SLIDE_DURATION }}
                    >
                        <ProviderReviews />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProviderDashPage