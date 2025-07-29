import { useAppointments } from '../hooks/useAppointments'
import LoadingSpinner from '../LoadingState'
import AppointmentsGrid from './AppointmentsGrid'

function ProviderAppointments() {
    const { appointments, setAppointments, status } = useAppointments()
    const bookedAppointments = appointments.filter(appointment => appointment.status === 'BOOKED')

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
            console.error('Error: ', error)
        }
    }

    return(
        <div className="p-15">
            <h3 className="dash-title">Appointments</h3>

            {status === 'loading' && <LoadingSpinner />}
            {status === 'error' && <p className="mt-3">Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p className="mt-3">No upcoming appointments.</p>}
            {status === 'success' && (
                <AppointmentsGrid
                    appointments={bookedAppointments}
                    role="provider"
                    onRead={markReadUnread}
                />
            )}
        </div>
    )
}

export default ProviderAppointments