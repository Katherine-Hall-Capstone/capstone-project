import { useUser } from '../UserContext'
import { useState, useEffect } from 'react'
import { useRefreshUser } from '../hooks/useRefreshUser'
import CalendarStatus from '../DashComponents/CalendarStatus'
import { FaTrashAlt } from "react-icons/fa"

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function ClientPreferences()  {
    const { user } = useUser()
    const [day, setDay] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [preferences, setPreferences] = useState([])
    const [errorMessage, setErrorMessage] = useState('')

    async function fetchPreferences() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/clients/${user.id}`, {
                credentials: 'include'
            })
            if(res.ok) {
                const data = await res.json()
                setPreferences(data)
            } else {
                console.error('Failed to fetch preferences')
            }
        } catch(error) {
            console.error(error)
        }
    }

    const refreshUser = useRefreshUser()

    useEffect(() => {
        fetchPreferences()
        refreshUser()
    }, [])

    async function handleAddWindow(event) {
        event.preventDefault()
        setErrorMessage('')

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/clients/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    dayOfWeek: day, 
                    startTime, 
                    endTime 
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add preference')
            }

            setDay('')
            setStartTime('')
            setEndTime('')
            fetchPreferences()
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        }
    }

    async function handleDelete(preferenceId) {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/preferences/clients/${user.id}/time-window/${preferenceId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            fetchPreferences()
        } catch (error) {
            console.error(error)
        }
    }

    return(
        <div className="p-15">
            <h3 className="dash-title">Set Your Preferences</h3>
            <div className="flex flex-col gap-20 mt-8 ml-6 mr-170">
                <div>
                    <p className="dash-header">Connect your Google Calendar?</p>
                    <p className="dash-message">Allow your new appointments to also appear as events in your Google Calendar</p>
                    <CalendarStatus googleConnected={user.googleConnected} />
                </div>

                <div>
                    <div className="flex flex-row justify-between items-start">
                        <div>
                            <h3 className="dash-header">Preferred Time Windows</h3>
                            <p className="dash-message">Set your preferred time windows for appointments (up to 1 per day)</p>
                            
                            <form onSubmit={handleAddWindow} className="mt-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <label>Day: </label>
                                        <select
                                            value={day} 
                                            onChange={event => setDay(event.target.value)} 
                                            required
                                            className="client-pref-box"
                                        >
                                            <option value="">--</option>
                                            {daysOfWeek.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <label>Start Time: </label>
                                        <input 
                                            type="time" 
                                            value={startTime} 
                                            onChange={event => setStartTime(event.target.value)} 
                                            className="client-pref-box"
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <label>End Time: </label>
                                        <input 
                                            type="time" 
                                            value={endTime} 
                                            onChange={event => setEndTime(event.target.value)} 
                                            className="client-pref-box"
                                            required 
                                        />
                                    </div>
                                </div>

                                <button                     
                                    type="submit" 
                                    className="primary-btn mt-4"
                                >
                                    Add Time Window
                                </button>
                            </form>

                            {errorMessage && <p className="message mt-2 text-red-600">{errorMessage}</p>}
                        </div>

                        <div className="min-w-[300px]">
                            <p className="text-center text-lg font-bold">Current Time Windows</p>
                            <ul className="mt-6 space-y-4">
                                {preferences.map(preference => (
                                    <li key={preference.id} className="list">
                                        {preference.dayOfWeek}: {new Date(`1970-01-01T${preference.startTime}`).toLocaleTimeString(undefined, { 
                                                                    hour: '2-digit', minute: '2-digit', hour12: true 
                                                                })} – {new Date(`1970-01-01T${preference.endTime}`).toLocaleTimeString(undefined, { 
                                                                        hour: '2-digit', minute: '2-digit', hour12: true })}
                                        <button onClick={() => handleDelete(preference.id)} className="cursor-pointer"><FaTrashAlt /></button>
                                    </li>
                                ))}
                            </ul>
                        </div>                 
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientPreferences