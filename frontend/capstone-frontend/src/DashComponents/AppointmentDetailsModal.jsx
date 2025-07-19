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
            className="fixed inset-0 bg-black/50 flex items-center justify-center" 
            onClick={onClose}
        >
            <div 
                className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full relative"
                onClick={(event) => event.stopPropagation()}
            >
                <button className="absolute top-3 left-3 text-black cursor-pointer" onClick={onClose}>×</button>

                <div className="flex flex-col items-center space-y-8 text-center">
                    <h2 className="font-bold text-2xl">Appointment Details</h2>

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

                    <button className="mt-6 bg-red-400 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-md cursor-pointer" onClick={handleCancel}>
                        Cancel Appointment
                    </button>
                </div>
                
            </div>
        </div>
    )
}

export default AppointmentDetailsModal