import '../css/ProviderPageClientView.css'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import { useUser } from '../UserContext'
import ClientBookingForm from './ClientBookingForm'

function ProviderPageClientView() {
    const { id } = useParams()
    const { user } = useUser()
    const [provider, setProvider] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [recommendedAppointments, setRecommendedAppointments] = useState([])
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [selectedService, setSelectedService] = useState(null)
    const [clientPreferences, setClientPreferences] = useState([])
    const [providerPreferences, setProviderPreferences] = useState(null)
    const showModal = selectedAppointment !== null

    async function fetchProvider(){
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}`)

            if(res.ok) {
                const data = await res.json()
                setProvider(data) 
            } else {
                console.error('Failed to fetch provider')
            }
        } catch(error) {
            console.error(error)
        }
    }

    async function fetchAppointments() {
        if(!selectedService) {
            return
        }

        try {
            /* When fetching appointments for the booking process, hide those that would occurr during already booked appointments */
            const resAvailable = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}/availability`)
            const resBooked = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}/booked`)

            if(resAvailable.ok && resBooked.ok) {
                const availableAppointments = await resAvailable.json()
                const bookedAppointments = await resBooked.json()

                const validAppointments = availableAppointments.filter(available => {
                    // Determines the start and end of each potential appointment based on the service chosen
                    const availableStart = new Date(available.startDateTime)
                    const availableEnd = new Date(availableStart.getTime() + selectedService.duration * 60000) // converts duration in ms since getTime is ms
                    
                    // Checks each provider's booked appointments to catch any conflicts with the potential available appointment
                    for(const booked of bookedAppointments) {
                        const bookedStart = new Date(booked.startDateTime)
                        const bookedEnd = new Date(booked.endDateTime)
                        
                        // Condition where there is an overlap, so the available appointment would not be possible -> prevent it from being chosen
                        if((availableStart < bookedEnd) && (availableEnd > bookedStart)) {
                            return false 
                        }
                    }
                    // Otherwise the potential appointment did not conflict with any of the booked appointments
                    return true 
                })
                // Display "Available Appointments" section
                setAppointments(validAppointments.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)))

                /* Handle Recommended Appointments */
                let filtered = validAppointments

                // 1) Filter for only available appointments within the client's windows, if exists 
                if(clientPreferences.length > 0) {
                    filtered = filterByClientWindows(filtered)
                }
                
                // 2) Filter excluding appointments that would exceed provider's max hours, if exists
                if(providerPreferences?.maxConsecutiveHours) {
                    filtered = filterByProviderHours(
                        filtered, 
                        bookedAppointments, 
                        selectedService.duration, 
                        providerPreferences.maxConsecutiveHours
                    )
                }
                // 3) Rank Appointments, if they exist 
                if(filtered.length > 0) {
                    filtered = rankAppointments(
                        filtered, 
                        bookedAppointments, 
                        providerPreferences.prefersEarly
                    )
                }

                // Display "Recommended Appointments" section (recommend nothing if both client and provider have no preferences)
                const shouldRecommend = clientPreferences.length > 0 || providerPreferences?.maxConsecutiveHours

                setRecommendedAppointments(shouldRecommend ? filtered : []) // Recommended could either be empty because both no preferences or filtering left no appointments
            } else {
                console.error('Failed to fetch appointments')
            }
        } catch(error) {
            console.error(error)
        }
    }

    function filterByClientWindows(validAppointments) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        return validAppointments.filter(appointment => {
            // Gets the day of a potential Recommended appointment
            const appointmentDayIndex = new Date(appointment.startDateTime).getDay()
            const appointmentDayString = daysOfWeek[appointmentDayIndex]            
            
            // Determines start and end of the appointment based on service chosen
            const appointmentStartTime = new Date(appointment.startDateTime).toTimeString().slice(0, 5) // .slice() to index 5 to limit time format to just hours and minutes
            const appointmentEndTime = new Date(new Date(appointment.startDateTime).getTime() + (selectedService.duration * 60000)).toTimeString().slice(0, 5) // calculates appointment's end
            
            // If the appointment's start and end falls between the client's preferred window, it should be Recommended
            return(clientPreferences.some(preference => {
                return preference.dayOfWeek === appointmentDayString 
                        && preference.startTime <= appointmentStartTime 
                        && preference.endTime >= appointmentEndTime
            }))
        })
    }

    async function fetchClientPreferences() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/clients/${user.id}`, {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                setClientPreferences(data)
            } else {
                console.error('Failed to fetch preferences')
            }
        } catch (error) {
            console.error(error)
        }
    }

    function filterByProviderHours(availableAppointments, bookedAppointments, serviceDuration, maxConsecutiveHours) {
        const maxHoursInMs = maxConsecutiveHours * 3600000 // -> 60 * 60 * 1000

        /* For every available appointment check if any booked appointment that are directly consecutive and calculate the duration */
        return availableAppointments.filter(available => {
            // Start time of the current available appointment
            let currentAvailStart = new Date(available.startDateTime)

            // Start the duration total with the service client is looking to book  
            let totalDurationInMs = serviceDuration * 60000

            // Keeps looking back for booked appts that are consecutive; breaks when it reaches one not consecutive 
            while(true) {
                const prevBookedAppt = bookedAppointments.find(booked => {
                    const bookedEnd = new Date(booked.endDateTime)
                    // If a booked appointment ends exactly when an available appointment start, it's consecutive
                    return bookedEnd.getTime() === currentAvailStart.getTime()
                })

                if(prevBookedAppt) {
                    // Calculate duration of the booked appointment just found
                    const bookedStart = new Date(prevBookedAppt.startDateTime)
                    const bookedDuration = new Date(prevBookedAppt.endDateTime) - bookedStart
                    // Add it to the total consecutive duration so far
                    totalDurationInMs += bookedDuration
                    // Shift the start time up to include the booked appointment in the consecutive block -> continues finding more consecutive appts
                    currentAvailStart = bookedStart
                } else {
                    break
                }
            }
            
            // Only include this available appointment as an option if it doesn't exceed provider's max consecutive hours
            return totalDurationInMs <= maxHoursInMs
        })
    }

    async function fetchProviderPreferences() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/preferences/providers/${id}`, {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                setProviderPreferences(data || null)
            }
        } catch (error) {
            console.error(error)
        }
    }

    function rankAppointments(appointments, bookedAppointments, prefersEarly) {
        return appointments.map(appointment => {
            // Get each filtered available appointment's start time and end time based on service chosen
            const appointmentStart = new Date(appointment.startDateTime)
            const appointmentEnd = new Date(appointmentStart.getTime() + selectedService.duration * 60000)
            
            /* Handle Gap Before */
            const appointmentsBefore = bookedAppointments
                .filter(booked => new Date(booked.endDateTime) <= appointmentStart) // Find booked appointments occurring BEFORE potential appointment
                .sort((a, b) => new Date(b.endDateTime) - new Date(a.endDateTime)) // Sort by putting closest before potential appointment in first position 
            
            const mostPrevious = appointmentsBefore[0]  // Get the closest appointment before 

            const gapBefore = mostPrevious ? appointmentStart - new Date(mostPrevious.endDateTime) : 0 // If appointment before exists, find gap before potential appointment; if not, use 0

            /* Handle Gap After */
            const appointmentsAfter = bookedAppointments
                .filter(booked => new Date(booked.startDateTime) >= appointmentEnd) // Find booked appointments occurring AFTER potential appointment
                .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)) // Sort by putting closest after potential appointment in first position 
            
            const mostUpcoming = appointmentsAfter[0] // Get the closest appointment after 

            const gapAfter = mostUpcoming ? new Date(mostUpcoming.startDateTime) - appointmentEnd : 0 // If appointment before exists, find gap before potential appointment; if not, use 0
            
            /* Put both gaps found in array */
            const bothGaps = [Math.min(gapBefore, gapAfter), Math.max(gapBefore, gapAfter)]

            // Each potential appointment now has the required information to rank
            return {
                ...appointment,
                bothGaps,
                appointmentStart
            }
        }).sort((a, b) => {
            if(a.bothGaps[0] !== b.bothGaps[0]) {
                return a.bothGaps[0] - b.bothGaps[0] // Ascending order with smallest gap time first
            }
            if(a.bothGaps[1] !== b.bothGaps[1]) {
                return a.bothGaps[1] - b.bothGaps[1]
            }

            // If both equal gap times, rank by provider's preference of earlier/later appts
            return prefersEarly ? a.appointmentStart - b.appointmentStart : b.appointmentStart - a.appointmentStart 
        })
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
        fetchProviderPreferences() 
    }, [id])

    useEffect(() => {
        if(selectedService) {
            fetchAppointments()
        }
    }, [selectedService])

    useEffect(() => {
        if (user) {
            fetchClientPreferences()
        }
    }, [user])

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
                    {recommendedAppointments.map((appointment, index) => (
                        <button 
                            key={appointment.id} 
                            onClick={() => handleOpenModal(appointment)}
                        >
                            <strong>{index + 1}.{' '}</strong>
                            {new Date(appointment.startDateTime).toLocaleString(undefined, {
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
                            {new Date(appointment.startDateTime).toLocaleString(undefined, {
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
                    onBookingSuccess={fetchAppointments}
                />
            )}
        </div>
    )
}

export default ProviderPageClientView