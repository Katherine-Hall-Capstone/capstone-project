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
            <h3 className="mb-4 text-2xl text-center font-semibold">Manage Preferences</h3>

            {!hasPreferences ? (
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-gray-500 italic">
                                What is the maximum amount of consecutive hours you'd like to work?
                            </label>
                            <input
                                type="number"
                                value={maxHours}
                                onChange={event => setMaxHours(event.target.value)}
                                className="w-20 p-1 bg-white border border-gray-300 focus:outline-none focus:ring-1 rounded-md"
                                required
                                min={1}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-gray-500 italic">
                                Do you prefer earlier or later appointments? 
                            </label>
                            <select
                                value={prefersEarly}
                                onChange={event => setPrefersEarly(event.target.value === 'true')}  // If option chosen is 'true' (string), convert to boolean true
                                className="w-20 p-1 bg-white 
                                border border-gray-300 focus:outline-none focus:ring-1 rounded-md"
                            >
                                <option value="true">Earlier</option>
                                <option value="false">Later</option>
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="mt-4 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-md cursor-pointer"
                    >
                        Set Preferences
                    </button>
                </form>
            ) : (
                <div className="flex flex-col items-center">
                    <div>
                        <p className="mb-2"><span className="text-gray-500 italic">Maximum Consecutive Hours: </span>{maxHours}</p>
                        <p><span className="text-gray-500 italic">Prefer: </span>{prefersEarly === true ? 'Earlier' : 'Later'} Appointments</p>
                    </div>

                    <button 
                        onClick={handleDelete}
                        className="mt-4 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-md cursor-pointer"
                    >
                        Delete Preferences
                    </button>
                </div>
            )}
            
            <p className="mt-2 min-h-5 text-red-600 text-center text-sm">{errorMessage}</p>
        </div>
    )
}

export default ProviderPreferences