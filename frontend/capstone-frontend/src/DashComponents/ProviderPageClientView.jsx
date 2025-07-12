import '../css/ProviderPageClientView.css'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import ClientBookingForm from './ClientBookingForm'

function ProviderPageClientView() {
    const { id } = useParams()
    const [provider, setProvider] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [recommendedAppointments, setRecommendedAppointments] = useState([])
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [selectedService, setSelectedService] = useState(null)
    const showModal = selectedAppointment !== null

    async function fetchProvider(){
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}`)

            if(res.ok) {
                const data = await res.json()
                setProvider(data); 
            } else {
                console.error('Failed to fetch provider')
            }
        } catch(error) {
            console.error(error)
        }
    }

    async function fetchAvailableAppointments() {
        if(!selectedService) {
            return
        }

        try {
            const resAvailable = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}/availability`)
            const resBooked = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}/booked`)

            if(resAvailable.ok && resBooked.ok) {
                const availableAppointments = await resAvailable.json()
                const bookedAppointments = await resBooked.json()

                const validAvailable = availableAppointments.filter(available => {
                    const availableStart = new Date(available.dateTime);
                    const availableEnd = new Date(availableStart.getTime() + selectedService.duration * 60000); // converts duration in ms since getTime is ms

                    for(const booked of bookedAppointments) {
                        const bookedStart = new Date(booked.dateTime)
                        const bookedEnd = new Date(booked.endDateTime)

                        if((availableStart < bookedEnd) && (availableEnd > bookedStart)) {
                            return false 
                        }
                    }
                    return true 
                })
                
                setAppointments(validAvailable.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))); 
            } else {
                console.error('Failed to fetch appointments')
            }
        } catch(error) {
            console.error(error)
        }
    }

    async function fetchRecommendedAppointments() {    
        if(!selectedService) {
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}/recommended`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setRecommendedAppointments(data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)))
            } else {
                console.error('Failed to fetch recommended appointments')
            }
        } catch (error) {
            console.error(error)
        }
    }

    function handleOpenModal(appointment) {
        setSelectedAppointment(appointment)
    }

    function handleCloseModal() {
        setSelectedAppointment(null)
    }

    function handleServiceSelect(event) {
        const value = event.target.value

        if(value === '') {
            setSelectedService(null)
            setAppointments([])
            setRecommendedAppointments([])
        } else{
            const serviceId = parseInt(event.target.value)
            const service = provider.servicesOffered.find(service => service.id === serviceId)
            setSelectedService(service)
        }
    }

    useEffect(() => {
        fetchProvider()
    }, [id])

    useEffect(() => {
        if(selectedService) {
            fetchAvailableAppointments()
            fetchRecommendedAppointments()
        }
    }, [selectedService])

    if (!provider) {
        return <p>Provider does not exist</p>
    }

    return(
        <div className="profile-page">
            <h2>Provider Profile</h2>
            <p>Name: {provider.name}</p>
            <p>Services: {provider.servicesOffered?.map(service => service.name).join(', ')}</p>

            <label>Select a service: </label>
            <select
                value={selectedService?.id || ''}
                onChange={handleServiceSelect}
            >   
                <option value="">--</option>
                {provider.servicesOffered?.map(service => (
                    <option key={service.id} value={service.id}>
                        {service.name} ({service.duration} min)
                    </option>
                ))}
            </select>

            <h3>Recommended Appointments</h3>
            {recommendedAppointments.length === 0 ? (
                <p>No recommended appointments</p>
            ) : (
                <div className="appointment-grid">
                    {recommendedAppointments.map((appointment) => (
                        <button 
                            key={appointment.id} 
                            onClick={() => handleOpenModal(appointment)}
                        >
                            {new Date(appointment.dateTime).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true  
                            })}
                        </button>
                    ))}
                </div>
            )}

            <h3>All Available Appointments</h3>
            {appointments.length ===  0 ? (
                <p>No available appointments</p>
            ) : (
                <div className="appointment-grid">
                    {appointments.map((appointment) => (
                        <button key={appointment.id} onClick={() => handleOpenModal(appointment)}>
                            {new Date(appointment.dateTime).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true  
                            })}
                        </button>
                    ))}
                </div>
            )}

            {showModal && (
                <ClientBookingForm 
                    provider={provider}
                    selectedAppointment={selectedAppointment}
                    selectedService={selectedService}
                    onClose={handleCloseModal}
                    onBookingSuccess={fetchAvailableAppointments}
                />
            )}
        </div>
    )
}

export default ProviderPageClientView