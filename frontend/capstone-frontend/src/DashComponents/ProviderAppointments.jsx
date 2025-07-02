import { useEffect, useState } from 'react'

function ProviderAppointments() {
    const [appointments, setAppointments] = useState([])
    const [status, setStatus] = useState('unrun')

    async function fetchAppointments() {
        setStatus('loading')
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
                credentials: 'include'
            })
            if(res.ok) {
                const data = await res.json()
                setAppointments(data)
                setStatus('success')
            } else {
                console.error('Failed to fetch appointments')
                setStatus('error')
            }
        } catch(error) {
            console.error(error) 
            setStatus('error')
        } 
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    async function markReadUnread(id) {
        try {   
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${id}/read`, {
                method: 'PUT',
                credentials: 'include'
            })
            if(res.ok) {
                // Takes existing appointments array and finds the matching appointment, then changes isNew field if provider selected
                setAppointments(prev => 
                    prev.map(appointment => 
                        appointment.id === id ? { ...appointment, isNew: !appointment.isNew } : appointment
                    )
                )
            }
        } catch(error) {    
            console.error(error)
            setStatus('error')
        }
    }

    const newBookings = appointments.filter(appointment => appointment.status === 'BOOKED' && appointment.isNew)
    const viewedBookings = appointments.filter(appointment => appointment.status === 'BOOKED' && !appointment.isNew)

    return(
        <div>
            <h2>New Bookings</h2>
            {newBookings.length === 0 ? (
                <p>No new bookings</p>
            ) : (
                newBookings.map(appointment => (
                    <div key={appointment.id} className="appointment-container">
                        <p>Client: {appointment.client.name}</p>
                        <p>Service: {appointment.serviceType}</p>
                        <p>Date: {new Date(appointment.dateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true  
                                })}
                        </p>
                        <button onClick={() => markReadUnread(appointment.id)}>
                            {appointment.isNew ? "Mark as Read" : "Mark as Unread"}
                        </button>
                    </div>
                ))
            )}

            <h2>Upcoming Appointments</h2>
            {viewedBookings.length === 0 ? (
                <p>Check your new bookings!</p>
            ) : (
                viewedBookings.map(appointment => (
                    <div key={appointment.id} className="appointment-container">
                        <p>Client: {appointment.client.name}</p>
                        <p>Service: {appointment.serviceType}</p>
                        <p>Date: {new Date(appointment.dateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true  
                                })}
                        </p>
                        <button onClick={() => markReadUnread(appointment.id)}>
                            {appointment.isNew ? "Mark as Read" : "Mark as Unread"}
                        </button>
                    </div>
                ))
            )}
        </div>
    )
}

export default ProviderAppointments