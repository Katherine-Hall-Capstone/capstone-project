import { useUser } from '../UserContext'
import { useState, useEffect } from 'react'
import { useRefreshUser } from '../hooks/useRefreshUser'
import ProviderServices from './ProviderServices'
import ProviderPreferences from './ProviderPreferences'
import CalendarStatus from '../DashComponents/CalendarStatus'
import { FaTrashAlt } from "react-icons/fa"

function ProviderAvailability() {
    const { user } = useUser()
    const [dateTime, setDateTime] = useState('')
    const [availabilities, setAvailabilities] = useState([])
    const [errorMessage, setErrorMessage] = useState('')

    async function fetchAvailabilities() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${user.id}/availability`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setAvailabilities(data.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)))
            } else {
                console.error('Failed to fetch available appointments')
            }
        } catch(error) {
            console.error('Error: ', error)
        }
    }
    
    const refreshUser = useRefreshUser()

    useEffect(() => {
        fetchAvailabilities()
        refreshUser()
    }, [])

    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${user.id}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({startDateTime: dateTime })
            })

            const data = await res.json()

            if(!res.ok) {
                throw new Error(data.error || 'Failed to add available appointment')
            }

            fetchAvailabilities()
            setDateTime('')
        } catch(error) {
            console.error('Error: ', error)
            setErrorMessage(error.message)
        }
    }

    async function handleDelete(availabilityId) {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${availabilityId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (res.ok) {
                fetchAvailabilities()
            } else {
                console.error('Failed to delete availability')
            }
        } catch (error) {
            console.error('Error: ', error)
        }
    }

    function getLocalDateTime() {
        const dateNow = new Date()
        // .getTimezoneOffset() returns difference between UTC and local time in minutes, so multiply by 60000 to get milliseconds
        const timezoneOffset = dateNow.getTimezoneOffset() * 60000
        // .getTime() is current time in milliseconds, subtract timezoneOffset to convert the UTC into user's local time
        const localTime = new Date(dateNow.getTime() - timezoneOffset)
        
        // .toISOString() gives more information than "datetime-local" needs, so slice() keeps only relevant information
        return localTime.toISOString().slice(0, 16)
    }

    return(
        <div className="p-15">
            <h3 className="dash-title">Set Your Preferences</h3>
            
            <div className="mt-8 mx-6 grid md:grid-cols-1 lg:grid-cols-2 gap-8 ">
                <div className="provider-pref-cont flex flex-col items-center">
                    <p className="provider-pref-title">Connect your Google Calendar?</p>
                    <p className="dash-message mb-3">Allow your new appointments to also appear as events in your Google Calendar</p>
                    <CalendarStatus googleConnected={user.googleConnected} />
                </div>

                <div className="provider-pref-cont">
                    <ProviderPreferences providerId={user.id} />
                </div>

                <div className="provider-pref-cont">
                    <p className="provider-pref-title">Manage Availabilities</p>

                    <div className="flex justify-around">
                        <div>
                            <h3 className="provider-pref-header">Add Availability:</h3>
                            <form 
                                onSubmit={handleSubmit}
                                className="flex flex-col items-center mt-3"
                            >
                                <input 
                                    type="datetime-local"
                                    value={dateTime}
                                    onChange={event => setDateTime(event.target.value)}
                                    min={getLocalDateTime()} // ensures provider cannot set date in past
                                    className="provider-serv-text w-60"
                                    required 
                                />

                                <button 
                                    type="submit"
                                    className="primary-btn mt-4"
                                >
                                    Add Slot
                                </button>

                                <p className="message mt-2 max-w-50 text-red-600">{errorMessage}</p>
                            </form>
                        </div>
                        
                        <div>
                            <h3 className="provider-pref-header">Available Appointments</h3>
                            <ul className="mt-3 space-y-4">
                                {availabilities.map(availability => (
                                    <li key={availability.id} className="provider-pref-list">
                                        {new Date(availability.startDateTime).toLocaleString(undefined, {
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true  
                                        })}
                                        
                                        <button onClick={() => handleDelete(availability.id)} className="cursor-pointer">
                                            <FaTrashAlt />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="provider-pref-cont">
                    <ProviderServices providerId={user.id} />
                </div>
            </div>
        </div>
    )
}

export default ProviderAvailability