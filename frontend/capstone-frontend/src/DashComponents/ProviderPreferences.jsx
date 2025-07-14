import { useState, useEffect } from 'react'
import '../css/ProviderPreferences.css'

function ProviderPreferences({ providerId }) {
    const [maxHours, setMaxHours] = useState('')
    const [prefersEarly, setPrefersEarly] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [hasPreferences, setHasPreferences] = useState(false)

    async function fetchPreferences() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/providers/${providerId}`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                if(data) {
                    setMaxHours(data.maxConsecutiveHours)
                    setPrefersEarly(data.prefersEarly)
                    setHasPreferences(true)
                } else {
                    setHasPreferences(false)
                }
            } else {
                console.error('Failed to fetch preferences')
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchPreferences()
    }, [providerId])


    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/providers/${providerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    maxConsecutiveHours: parseInt(maxHours),
                    prefersEarly
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save preferences')
            }
            setHasPreferences(true)
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        }
    }

    async function handleDelete() {
        setErrorMessage('')

        try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/provider/${providerId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete preferences')
            }

            setMaxHours('')
            setPrefersEarly(true)
            setHasPreferences(false)
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        }
    }

    return(
        <div>
            <h3>Manage Preferences</h3>

            {!hasPreferences ? (
                <form onSubmit={handleSubmit} className="provider-preference-form">
                    <div className="hours">
                        <label>
                            What is the maximum amount of consecutive hours you'd like to work?
                        </label>
                        <input
                            type="number"
                            value={maxHours}
                            onChange={event => setMaxHours(event.target.value)}
                            required
                            min={1}
                        />
                    </div>

                    <div className="early-late">
                        <label>
                            Do you prefer earlier or later appointments? 
                        </label>
                        <select
                            value={prefersEarly}
                            onChange={event => setPrefersEarly(event.target.value === 'true')}  // If option chosen is 'true' (string), convert to boolean true
                        >
                            <option value="true">Earlier</option>
                            <option value="false">Later</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-preferences">Set Preferences</button>
                </form>
            ) : (
                <div className="current-preferences">
                    <p>Maximum Consecutive Hours: {maxHours}</p>
                    <p>Prefer: {prefersEarly === true ? 'Earlier' : 'Later'} Appointments</p>

                    <button onClick={handleDelete}>Delete Preferences</button>
                </div>
            )}
            
            {errorMessage && <p className="error-msg">{errorMessage}</p>}
        </div>
    )
}

export default ProviderPreferences