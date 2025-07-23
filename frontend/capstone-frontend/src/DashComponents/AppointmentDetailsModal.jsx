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
        <div 
            className="modal-overlay" 
            onClick={onClose}
        >
            <div 
                className="modal-content"
                onClick={(event) => event.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="modal-text">
                    <h2 className="modal-title">Appointment Details</h2>

                    <div>
                        <p><span className="font-semibold">On: </span> 
                            {new Date(appointment.startDateTime).toLocaleString(undefined, {
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'  
                            })}
                        </p>
                        <p><span className="font-semibold">Time: </span>
                            {new Date(appointment.startDateTime).toLocaleString(undefined, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true  
                            })} - {new Date(appointment.endDateTime).toLocaleString(undefined, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true  
                            })}
                        </p>
                    </div>
                    
                    <div>
                        <p><span className="font-semibold">Service: </span> {appointment.service.name}</p>
                        <p><span className="font-semibold">Duration: </span> {appointment.service.duration} minutes</p>
                    </div>
                        
                    <p><span className="font-semibold">Notes: </span> {appointment.notes || 'N/A'}</p>

                    <button className="modal-btn bg-red-400 hover:bg-red-500 " onClick={handleCancel}>
                        Cancel Appointment
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AppointmentDetailsModal