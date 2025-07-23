import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLogout } from '../hooks/useLogout'
import ClientSearchForm from '../DashComponents/ClientSearchForm'
import ClientAppointments from '../DashComponents/ClientAppointments'
import ClientReviews from '../DashComponents/ClientReviews'
import ClientPreferences from '../DashComponents/ClientPreferences'
import { SLIDE_DISTANCE, SLIDE_DURATION } from '../constants'

const tabs = ['search', 'appointments', 'reviews', 'preferences']

function ClientDashPage() {
    const logout = useLogout()
    const [activeTab, setActiveTab] = useState('appointments')
    const [direction, setDirection] = useState(1)

    function changeTab(newTab) {
        if (newTab === activeTab) {
            return
        }
        
        // If new tab clicked is on right of current tab, it will slide in from the right (represented with direction = 1)
        tabs.indexOf(newTab) > tabs.indexOf(activeTab) ? setDirection(1) : setDirection(-1)
        setActiveTab(newTab)
    }

    return(
        <div>
            <div className="flex flex-row items-center justify-between mt-2 px-10 py-2">
                <p className="text-xl text-slate-900 font-bold">EasyPoint</p>

                <nav className="flex items-center gap-1 px-1 py-1 bg-gray-100 rounded-full">
                    <button 
                        onClick={() => changeTab('search')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'search' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        Search
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

                    <button 
                        onClick={() => changeTab('preferences')}
                        className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === 'preferences' ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                    >
                        My Preferences
                    </button>
                </nav>

                <button 
                    onClick={logout}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-600 transition duration-200 text-white font-semibold rounded-md cursor-pointer"
                >
                    Logout
                </button>
            </div>

            {/* 
            - AnimatePresence and mode=wait: allows for exit animations to happen before changing the activeTab
            - motion.div: allows animations to be applied to divs 
            - initial: determines that the div starts transparently 300px off the screen, either left or right based on direction (changeTab function)
            - animate: places the div in view since x = 0 and is visible with opacity = 1
            - exit: slides the tab out in the opposite direction it came from ('search' and 'preferences' are not opposite because they're on the edges)
            - transition: determines the speed of the animations in seconds 
            */}

            <AnimatePresence mode="wait">
                {activeTab === 'search' && (
                    <motion.div
                        key="search"
                        initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        transition={{ duration: SLIDE_DURATION }}
                    >
                        <ClientSearchForm />
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
                        <ClientAppointments />
                    </motion.div>
                )}

                {activeTab === 'reviews' && (
                    <motion.div
                        key="reviews"
                        initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -SLIDE_DISTANCE, opacity: 0 }}
                        transition={{ duration: SLIDE_DURATION }}
                    >
                        <ClientReviews />
                    </motion.div>
                )}

                {activeTab === 'preferences' && (
                    <motion.div
                        key="preferences"
                        initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                        transition={{ duration: SLIDE_DURATION }}
                    >
                        <ClientPreferences />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ClientDashPage