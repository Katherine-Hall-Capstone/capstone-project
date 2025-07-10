import { useState } from 'react'
import '../css/ClientBookingForm.css'

function ClientBookingForm({ provider, selectedAppointment, onClose, onBookingSuccess }) {
    const [formData, setFormData] = useState({ serviceId: '', notes: '' })
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
                body: JSON.stringify(formData)
            })

            if(res.ok) {
                setSuccessMessage('Booking successful! See you soon.')
                setFormData({ serviceId: '', notes: '' })
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
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>x</button>

                <h3>Book Appointment</h3>
                <form onSubmit={handleSubmit} className="booking-form">
                    <div>
                        <strong>Provider: </strong> 
                        {provider.name}
                    </div>

                    <div>
                        <strong>When? </strong>
                        {new Date(selectedAppointment.dateTime).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true  
                        })}
                    </div>

                    <div>
                        <strong>Service Type: </strong>
                        <select name="serviceId" value={formData.serviceId} onChange={handleChange} required>
                            <option value="">Select a service</option>
                            {provider.servicesOffered.map(service => (
                                <option key={service.id} value={service.id}>{service.name} ({service.duration} min)</option>
                            ))}
                        </select>
                    </div>

                    <div className="notes">
                        <strong>Notes (Optional):</strong>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} />
                    </div>
                    
                    <button type="submit">Confirm Appointment</button>
                    
                    {successMessage && <p>{successMessage}</p>}
                </form>
            </div>
        </div>
    )
}

export default ClientBookingForm
