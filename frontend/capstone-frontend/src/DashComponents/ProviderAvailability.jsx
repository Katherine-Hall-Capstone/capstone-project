import { useUser } from '../UserContext'
import { useState } from 'react'

function ProviderAvailability() {
    const { user } = useUser()
    const [dateTime, setDateTime] = useState('')

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
        </div>
    )
}

export default ProviderAvailability