import { useState } from 'react'

function ClientBookingForm({ provider, selectedAppointment, selectedService, onClose, onBookingSuccess }) {
    const [formData, setFormData] = useState({ notes: '' })
    const [successMessage, setSuccessMessage] = useState('')

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${selectedAppointment.id}/book`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ ...formData, serviceId: selectedService.id })
            })

            if(res.ok) {
                setSuccessMessage('Booking successful! See you soon.')
                setFormData({ notes: '' })
                onBookingSuccess()

                setTimeout(() => {
                    setSuccessMessage('')
                    onClose()
                }, 1000)
            } else {
                console.error('Booking failed')
            }
        } catch(error) {
            console.error(error)
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
                <button className="modal-close" onClick={onClose}>x</button>

                <div className="modal-text">
                    <h3 className="modal-title">Book Appointment</h3>
                    
                    <form 
                        onSubmit={handleSubmit} 
                        className="flex flex-col items-center gap-3"
                    >
                        <div>
                            <span className="font-semibold">Provider: </span> 
                            {provider.name}
                        </div>

                        <div>
                            <span className="font-semibold">When? </span> 
                            {new Date(selectedAppointment.startDateTime).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true  
                            })}
                        </div>

                        <div>
                            <span className="font-semibold">Service Type: </span> 
                            {selectedService.name} ({selectedService.duration} min)
                        </div>
                    
                        <div className="flex flex-col">
                            <span className="font-semibold">Notes (Optional): </span> 
                            <textarea 
                                name="notes" 
                                value={formData.notes} 
                                onChange={handleChange} 
                                className="provider-serv-text mt-1 h-30 resize-none"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="modal-btn bg-green-600 hover:bg-green-500"
                        >
                            Confirm Appointment
                        </button>
                        
                        <p className="message text-green-600">{successMessage}</p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ClientBookingForm
