import { useState, useEffect } from 'react'

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
            console.error('Error: ', error)
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
            console.error('Error: ', error)
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
            console.error('Error: ', error)
            setErrorMessage(error.message)
        }
    }

    return(
        <div>
            <h3 className="provider-pref-title">Manage Preferences</h3>

            {!hasPreferences ? (
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="dash-message">
                                What is the maximum amount of consecutive hours you'd like to work?
                            </label>
                            <input
                                type="number"
                                value={maxHours}
                                onChange={event => setMaxHours(event.target.value)}
                                className="provider-pref-box"
                                required
                                min={1}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="dash-message">
                                Do you prefer earlier or later appointments? 
                            </label>
                            <select
                                value={prefersEarly}
                                onChange={event => setPrefersEarly(event.target.value === 'true')}  // If option chosen is 'true' (string), convert to boolean true
                                className="provider-pref-box"
                            >
                                <option value="true">Earlier</option>
                                <option value="false">Later</option>
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="primary-btn mt-4"
                    >
                        Set Preferences
                    </button>
                </form>
            ) : (
                <div className="flex flex-col items-center">
                    <div>
                        <p className="mb-2"><span className="dash-message">Maximum Consecutive Hours: </span>{maxHours}</p>
                        <p><span className="dash-message">Prefer: </span>{prefersEarly === true ? 'Earlier' : 'Later'} Appointments</p>
                    </div>

                    <button 
                        onClick={handleDelete}
                        className="primary-btn mt-4"
                    >
                        Delete Preferences
                    </button>
                </div>
            )}
            
            <p className="message mt-2 text-red-600">{errorMessage}</p>
        </div>
    )
}

export default ProviderPreferences