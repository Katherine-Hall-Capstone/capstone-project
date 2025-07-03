import '../css/ProviderAppointments.css'
import { useAppointments } from '../hooks/useAppointments'

function ProviderAppointments() {
    const { appointments, setAppointments, status } = useAppointments()

    async function markReadUnread(id) {
        try {   
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${id}/read`, {
                method: 'PUT',
                credentials: 'include'
            })
            if(res.ok) {
                // Takes existing appointments array and finds the matching appointment, then changes isUnread field if provider selected
                setAppointments(prev => 
                    prev.map(appointment => 
                        appointment.id === id ? { ...appointment, isUnread: !appointment.isUnread } : appointment
                    )
                )
            }
        } catch(error) {    
            console.error(error)
        }
    }

    const bookedAppointments = appointments.filter(appointment => appointment.status === 'BOOKED')

    return(
        <div>
            {status === 'loading' && <p>Loading...</p>}
            {status === 'error' && <p>Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p>No upcoming appointments.</p>}

            <h2>Upcoming Appointments</h2>
            <div className="upcoming-appointment-grid">
                {bookedAppointments.map(appointment => (
                    <div key={appointment.id} className={`appointment-container ${appointment.isUnread ? 'new-appointment' : ''}`}>
                        <p>Date: {new Date(appointment.dateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true  
                                })}
                        </p>
                        <p>Service: {appointment.serviceType}</p>
                        <p>Client: {appointment.client.name}</p>

                        <button onClick={() => markReadUnread(appointment.id)}>
                            {appointment.isUnread ? "Mark as Read" : "Mark as Unread"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProviderAppointments