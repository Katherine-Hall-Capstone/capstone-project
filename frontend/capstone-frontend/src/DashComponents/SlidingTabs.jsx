import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SLIDE_DISTANCE, SLIDE_DURATION } from '../constants'
import { useLogout } from '../hooks/useLogout'

function SlidingTabs({ tabs, components }) {
    const [activeTab, setActiveTab] = useState(tabs[1])
    const [direction, setDirection] = useState(1)
    const logout = useLogout()

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
            <div className="flex items-center justify-between mt-2 px-10 py-2">
                <p className="logo">EasyPoint</p>

                <nav className="flex items-center gap-1 px-1 py-1 bg-gray-100 rounded-full">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => changeTab(tab)}
                            className={`px-5 py-3 rounded-full cursor-pointer transition-colors duration-300 ${activeTab === tab ? 'bg-slate-900 text-white font-semibold' : 'text-gray-500'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                <button 
                    onClick={logout}
                    className="primary-btn"
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
                <motion.div
                    key={activeTab}
                    initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -SLIDE_DISTANCE, opacity: 0 }}
                    transition={{ duration: SLIDE_DURATION }}
                >
                    {components[activeTab]}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default SlidingTabs