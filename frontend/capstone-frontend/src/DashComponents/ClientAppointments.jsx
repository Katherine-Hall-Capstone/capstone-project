import { useAppointments } from '../hooks/useAppointments'
import LoadingSpinner from '../LoadingState'
import AppointmentsGrid from './AppointmentsGrid'


function ClientAppointments() {
    const { appointments, status } = useAppointments()

    return(
        <div className="p-15">
            <h3 className="dash-title">Appointments</h3>

            {status === 'loading' && <LoadingSpinner />}
            {status === 'error' && <p className="mt-3">Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p className="mt-3">No upcoming appointments.</p>}
            {status === 'success' && appointments.length !== 0 && (
                <AppointmentsGrid 
                    appointments={appointments} 
                    role="client" 
                />
            )}
        </div>
    )
}

export default ClientAppointments