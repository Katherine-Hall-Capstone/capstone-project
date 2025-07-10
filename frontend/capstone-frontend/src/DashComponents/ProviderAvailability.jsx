import { useUser } from '../UserContext'
import { useState, useEffect } from 'react'

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
                setAvailabilities(data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)))
            } else {
                console.error('Failed to fetch available appointments')
            }
        } catch(error) {
            console.error(error)
        }
    }
    
    useEffect(() => {
        fetchAvailabilities()
    }, [])

    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${user.id}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ dateTime })
            })

            const data = await res.json()

            if(!res.ok) {
                throw new Error(data.error || 'Failed to add available appointment')
            }

            fetchAvailabilities()
            setDateTime('')
        } catch(error) {
            console.error(error)
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
            console.error(error)
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
        <div>
            <h3>Add Availability</h3>
            <form onSubmit={handleSubmit}>
                <input 
                    type="datetime-local"
                    value={dateTime}
                    onChange={event => setDateTime(event.target.value)}
                    min={getLocalDateTime()} // ensures provider cannot set date in past 
                />
                <button type="submit">Add Slot</button>
            </form>

            <h4>Available Appointments</h4>
            <ul>
                {availabilities.map(availability => (
                    <li key={availability.id}>
                        {new Date(availability.dateTime).toLocaleString(undefined, {
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true  
                        })}
                        
                        <button onClick={() => handleDelete(availability.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {errorMessage && (<p className="error-msg">{errorMessage}</p>)}
        </div>
    )
}

export default ProviderAvailability