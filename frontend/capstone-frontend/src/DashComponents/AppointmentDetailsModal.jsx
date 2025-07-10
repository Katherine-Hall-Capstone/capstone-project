import '../css/AppointmentDetailsModal.css'

function AppointmentDetailsModal({ appointment, onClose }) {
    async function handleCancel() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${appointment.id}/cancel`, {
                method: 'PUT',
                credentials: 'include',
            })

            if (res.ok) {
                onClose()
                window.location.reload()              
            } else {
                console.error('Failed to cancel appointment')
            }
        } catch (err) {
            console.error('Error:', err)
        }
    }
    
    
    return (
        <div className="appt-modal-overlay">
            <div className="appt-modal-content">
                <button className="close-button" onClick={onClose}>×</button>

                <h2>Appointment Details</h2>

                <p>Start: {new Date(appointment.dateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true  
                                    })}
                </p>
                <p>End: {new Date(appointment.endDateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true  
                                    })}
                </p>
                <p>Service: {appointment.service.name}</p>
                <p>Duration: {appointment.service.duration} minutes</p>
                <p>Notes: {appointment.notes || 'N/A'}</p>

                <button className="cancel-appt-button" onClick={handleCancel}>
                    Cancel Appointment
                </button>
            </div>
        </div>
    )
}

export default AppointmentDetailsModal