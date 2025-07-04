import { useState } from 'react'
import '../css/ClientBookingForm.css'

function ClientBookingForm({ provider, selectedAppointment, onClose, onBookingSuccess }) {
    const [formData, setFormData] = useState({ serviceType: '', notes: '' })
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
                setFormData({ serviceType: '', notes: '' })
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
                        <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                            <option value="">Select a service</option>
                            {provider.servicesOffered.map((service, index) => (
                                <option key={index} value={service}>{service}</option>
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
