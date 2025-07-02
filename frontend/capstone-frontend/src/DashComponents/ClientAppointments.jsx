import { useAppointments } from '../hooks/useAppointments'

function ClientAppointments() {
    const { appointments, status } = useAppointments()

    return(
        <div>
            {status === 'loading' && <p>Loading...</p>}
            {status === 'error' && <p>Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p>No upcoming appointments.</p>}
            
            <h3>Upcoming Appointments</h3>
            {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-container">
                    <p>Date: {new Date(appointment.dateTime).toLocaleString(undefined, {
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true  
                            })}
                    </p>
                    <p>Service: {appointment.serviceType}</p>
                    <p>Provider: {appointment.provider.name}</p>
                </div>
            ))}
        </div>
    )
}

export default ClientAppointments