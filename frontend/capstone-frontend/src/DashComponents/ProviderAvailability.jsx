import { useUser } from '../UserContext'
import { useState, useEffect } from 'react'

function ProviderAvailability() {
    const { user } = useUser()
    const [dateTime, setDateTime] = useState('')
    const [availabilities, setAvailabilities] = useState([])

    async function fetchAvailabilities() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${user.id}/availability`, {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                setAvailabilities(data)
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

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${user.id}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ dateTime })
            })

            if(res.ok) {
                const data = await res.json()
                fetchAvailabilities()
            } else {
                console.error('Failed to add available appointment')
            }
        } catch(error) {
            console.error(error)
        }
    }

    return(
        <div>
            <h3>Add Availability</h3>
            <form onSubmit={handleSubmit}>
                <input 
                    type="datetime-local"
                    value={dateTime}
                    onChange={event => setDateTime(event.target.value)}
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
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ProviderAvailability