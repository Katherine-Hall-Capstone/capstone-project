import { useAppointments } from '../hooks/useAppointments'
import { useState } from 'react'
import AppointmentDetailsModal from './AppointmentDetailsModal'
import LoadingSpinner from '../LoadingState'
import { IoMailUnread } from "react-icons/io5"
import { IoMailOpenOutline } from "react-icons/io5"


function ProviderAppointments() {
    const { appointments, setAppointments, status } = useAppointments()
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const showModal = selectedAppointment !== null

    async function markReadUnread(id) {
        try {   
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${id}/read`, {
                method: 'PUT',
                credentials: 'include'
            })
            if(res.ok) {
                // Takes existing appointments array and finds the matching appointment, then changes isUnread field if provider selected
                setAppointments(prev => 
                    prev.map(appointment => 
                        appointment.id === id ? { ...appointment, isUnread: !appointment.isUnread } : appointment
                    )
                )
            }
        } catch(error) {    
            console.error(error)
        }
    }

    function handleOpenModal(appointment) {
        setSelectedAppointment(appointment)
    }

    function handleCloseModal() {
        setSelectedAppointment(null)
    }

    const bookedAppointments = appointments.filter(appointment => appointment.status === 'BOOKED')

    return(
        <div className="p-15">
            <h3 className="text-4xl font-bold text-slate-900">Upcoming Appointments</h3>

            {status === 'loading' && <LoadingSpinner />}
            {status === 'error' && <p className="mt-3">Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p className="mt-3">No upcoming appointments.</p>}

            <div className="mt-8 mx-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center">
                {bookedAppointments.map(appointment => (
                    <div 
                        key={appointment.id} 
                        className={`flex flex-col justify-between h-[300px] p-6 transition-transform duration-300 transform hover:scale-105 border-1 ${appointment.isUnread ? 'border-gray-300' : 'border-gray-200'} shadow-md ${appointment.isUnread ? 'bg-gray-200' : 'bg-white'} rounded-lg cursor-pointer`}
                        onClick={() => handleOpenModal(appointment)}
                    >
                        <div className="flex flex-col gap-2"> 
                            <p className="text-xl text-slate-900 font-bold underline">{new Date(appointment.startDateTime).toLocaleString(undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true  
                                })} - {new Date(appointment.endDateTime).toLocaleString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true  
                                        })}
                            </p>

                            <p className="text-gray-500 text-sm italic">{new Date(appointment.startDateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <p className="text-slate-600 text-xl text-center font-bold">{appointment.service.name}</p>

                        <div className="flex justify-between items-center">
                            <p className="text-md font-semibold">Client: <span className="font-normal">{appointment.client.name}</span></p>

                            <button 
                                onClick={(event) => {
                                    markReadUnread(appointment.id)
                                    event.stopPropagation()
                                }}
                                className="text-2xl cursor-pointer"
                            >
                                {appointment.isUnread ? <IoMailUnread /> : <IoMailOpenOutline />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && selectedAppointment && (
                <AppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}

export default ProviderAppointments