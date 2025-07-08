import '../css/AppointmentDetailsModal.css'

function AppointmentDetailsModal({ appointment, onClose }) {
    return (
        <div className="appt-modal-overlay">
            <div className="appt-modal-content">
                <button className="close-button" onClick={onClose}>×</button>

                <h2>Appointment Details</h2>

                <p>Date: {new Date(appointment.dateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true  
                                })}</p>
                <p>Service: {appointment.serviceType}</p>
                <p>Notes: {appointment.notes || 'No notes'}</p>
                <p>Status: {appointment.status}</p>
            </div>
        </div>
    )
}

export default AppointmentDetailsModal