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
                // Get backend error message and log it for debugging
                const errorData = await res.json();
                console.error('Booking failed:', errorData.error || 'Unknown error');
            }
        } catch(error) {
            console.error(error)
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative"
                onClick={(event) => event.stopPropagation()}
            >
                <button className="absolute top-3 left-3 text-black cursor-pointer" onClick={onClose}>x</button>

                <div className="flex flex-col items-center space-y-8 text-center">
                    <h3 className="font-bold text-2xl">Book Appointment</h3>
                    
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
                                className="mt-1 p-2 h-30 border border-gray-300 rounded-md focus:outline-none focus:ring-1 resize-none"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="mt-6 bg-green-600 hover:bg-green-500 duration-200 w-50 text-white text-sm font-semibold px-4 py-2 rounded-md cursor-pointer"
                        >
                            Confirm Appointment
                        </button>
                        
                        <p className="text-green-600 min-h-5">{successMessage}</p>
                    </form>
                </div>
                
                
            </div>
        </div>
    )
}

export default ClientBookingForm
