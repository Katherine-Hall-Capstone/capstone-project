import { useEffect, useState } from 'react'

function ClientAppointments() {
    const [appointments, setAppointments] = useState([])
    const [status, setStatus] = useState('unrun')

    async function fetchAppointments() {
        setStatus('loading')
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
                credentials: 'include'
            })
            if(res.ok) {
                const data = await res.json()
                setAppointments(data)
                setStatus('success')
            } else {
                console.error('Failed to fetch appointments')
                setStatus('error')
            }
        } catch(error) {
            console.error(error) 
            setStatus('error')
        } 
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    return(
        <div>
            <h3>Upcoming Appointments</h3>
            {status === 'loading' && <p>Loading...</p>}
            {status === 'error' && <p>Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p>No upcoming appointments.</p>}

            <ul>
                {appointments.map(appointment => (
                    <li key={appointment.id}>
                        {appointment.serviceType} on {new Date(appointment.dateTime).toLocaleString(undefined, {
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true  
                        })} with {appointment.provider.name}, notes: {appointment.notes}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ClientAppointments