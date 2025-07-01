import '../css/ProviderPageClientView.css'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import ClientBookingForm from './ClientBookingForm'

function ProviderPageClientView() {
    const { id } = useParams()
    const [provider, setProvider] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [showModal, setShowModal] = useState(false)

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
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}/availability`)

            if(res.ok) {
                const data = await res.json()
                setAppointments(data); 
            } else {
                console.error('Failed to fetch appointments')
            }
        } catch(error) {
            console.error(error)
        }
    }

    function handleClickAppointment(appointment) {
        setSelectedAppointment(appointment)
        setShowModal(true)
    }

    useEffect(() => {
        fetchProvider()
        fetchAvailableAppointments()
    }, [id])

    if (!provider) {
        return <p>Provider does not exist</p>
    }

    return(
        <div className="profile-page">
            <h2>Provider Profile</h2>
            <p>ID: {provider.id}</p>
            <p>Name: {provider.name}</p>
            <p>Services: {provider.servicesOffered?.join(', ')}</p>

            <h3>Available Appointments</h3>
            {appointments.length ===  0 ? (
                <p>No available appointments</p>
            ) : (
                <div className="appointment-grid">
                    {appointments.map((appointment) => (
                        <button key={appointment.id} onClick={() => handleClickAppointment(appointment)}>
                            {new Date(appointment.dateTime).toLocaleString()}
                        </button>
                    ))}
                </div>
            )}

            {showModal && (
                <ClientBookingForm 
                    provider={provider}
                    selectedAppointment={selectedAppointment}
                    onClose={() => setShowModal(false)}
                    onBookingSuccess={fetchAvailableAppointments}
                />
            )}
        </div>
    )
}

export default ProviderPageClientView