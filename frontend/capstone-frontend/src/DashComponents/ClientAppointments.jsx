import '../css/ClientAppointments.css';
import { useAppointments } from '../hooks/useAppointments'
import { useState } from 'react'
import AppointmentDetailsModal from './AppointmentDetailsModal'

function ClientAppointments() {
    const { appointments, status } = useAppointments()
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const showModal = selectedAppointment !== null

    function handleOpenModal(appointment) {
        setSelectedAppointment(appointment)
    }

    function handleCloseModal() {
        setSelectedAppointment(null)
    }

    return(
        <div>
            {status === 'loading' && <p>Loading...</p>}
            {status === 'error' && <p>Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p>No upcoming appointments.</p>}
            
            <h3>Upcoming Appointments</h3>
            <div className="upcoming-appointment-grid">
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

                        <button onClick={() => handleOpenModal(appointment)}>View Details</button>

                        <div>
                            {showModal && selectedAppointment && (
                                <AppointmentDetailsModal
                                    appointment={selectedAppointment}
                                    onClose={handleCloseModal}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ClientAppointments