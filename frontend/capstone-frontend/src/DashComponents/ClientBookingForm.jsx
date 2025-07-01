import { useState } from 'react'

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
                <h3>Book Appointment</h3>
                <form onSubmit={handleSubmit} className="booking-form">
                    <label>Provider: {provider.name}</label>

                    <label>When? {new Date(selectedAppointment.dateTime).toLocaleString()}</label>

                    <label>
                        Service Type:
                        <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                            <option value="">Select a service</option>
                            {provider.servicesOffered.map((service, index) => (
                                <option key={index} value={service}>{service}</option>
                            ))}
                        </select>
                    </label>

                    <div className="notes">
                        <label>Notes (Optional):</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} />
                    </div>
                    
                    <div className="buttons">
                        <button type="submit">Confirm Appointment</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>

                    {successMessage && <p>{successMessage}</p>}
                </form>
            </div>
        </div>
    )
}

export default ClientBookingForm
