import { useUser } from '../UserContext'
import { useState, useEffect } from 'react'

function ClientPreferences()  {
    const { user } = useUser()
    const [day, setDay] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [preferences, setPreferences] = useState([])
    const [errorMessage, setErrorMessage] = useState('')

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesdsay', 'Thursday', 'Friday']

    async function fetchPreferences() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/${user.id}`, {
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

    useEffect(() => {
        fetchPreferences()
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
        <div>
            <h3>Preferred Time Windows</h3>
            <form onSubmit={handleAddWindow}>
                <label>
                    Day:
                    <select
                        value={day} 
                        onChange={event => setDay(event.target.value)} 
                        required
                    >
                        <option value="">--</option>
                        {daysOfWeek.map(day => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                </label>

                <label>
                    Start Time:
                    <input 
                        type="time" 
                        value={startTime} 
                        onChange={event => setStartTime(event.target.value)} 
                        required 
                    />
                </label>

                <label>
                    End Time:
                    <input 
                        type="time" 
                        value={endTime} 
                        onChange={event => setEndTime(event.target.value)} 
                        required 
                    />
                </label>

                <button type="submit">Add Time Window</button>
            </form>

            {errorMessage && <p className="error-msg">{errorMessage}</p>}

            <ul>
                {preferences.map(preference => (
                    <li key={preference.id}>
                        {/* Helps displays 24 hour time format as 12 hour */}
                        {preference.dayOfWeek}: {new Date(`1970-01-01T${preference.startTime}`).toLocaleTimeString(undefined, { 
                                                    hour: '2-digit', minute: '2-digit', hour12: true 
                                                })} – {new Date(`1970-01-01T${preference.endTime}`).toLocaleTimeString(undefined, { 
                                                        hour: '2-digit', minute: '2-digit', hour12: true })}
                        <button onClick={() => handleDelete(preference.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ClientPreferences