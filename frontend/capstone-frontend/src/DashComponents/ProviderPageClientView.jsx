import { useParams } from 'react-router'
import { useEffect, useState } from 'react'

function ProviderPageClientView() {
    const { id } = useParams()
    const [provider, setProvider] = useState(null)
    const [appointments, setAppointments] = useState([])

    async function fetchProvider(){
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}`)

            if(res.ok) {
                const data = await res.json()
                setProvider(data); 
            } else {
                console.error('Failed to fetch provider')
            }
        } catch(error) {
            console.error(error)
        }
    }

    async function fetchAvailableAppointments() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}/availability`)

            if(res.ok) {
                const data = await res.json()
                setAppointments(data); 
            } else {
                console.error('Failed to fetch appointments')
            }
        } catch(error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProvider()
        fetchAvailableAppointments()
    }, [id])

    if (!provider) {
        return <p>Provider does not exist</p>
    }

    return(
        <div>
            <h2>Provider Profile</h2>
            <p>ID: {provider.id}</p>
            <p>Name: {provider.name}</p>
            <p>Services: {provider.servicesOffered?.join(', ')}</p>

            <h3>Available Appointments</h3>
            {appointments.length ===  0 ? (
                <p>No available appointments</p>
            ) : (
                appointments.map((appointment) => (
                    <button key={appointment.id}>
                        {new Date(appointment.dateTime).toLocaleString()}
                    </button>
                ))
            )}
        </div>
    )
}

export default ProviderPageClientView