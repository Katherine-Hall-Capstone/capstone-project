import { useAppointments } from '../hooks/useAppointments'
import { useState } from 'react'
import AppointmentDetailsModal from './AppointmentDetailsModal'
import LoadingSpinner from '../LoadingState'

function ClientAppointments() {
    const { appointments, status } = useAppointments()
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const showModal = selectedAppointment !== null

    function handleOpenModal(appointment) {
        setSelectedAppointment(appointment)
    }

    function handleCloseModal() {
        setSelectedAppointment(null)
    }

    return(
        <div className="p-15">
            <h3 className="text-4xl font-bold text-slate-900">Upcoming Appointments</h3>

            {status === 'loading' && <LoadingSpinner />}
            {status === 'error' && <p className="mt-3">Something went wrong.</p>}
            {status === 'success' && appointments.length === 0 && <p className="mt-3">No upcoming appointments.</p>}

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center mt-8 mx-6">
                {appointments.map(appointment => (
                    <div 
                        key={appointment.id} 
                        className="flex flex-col justify-between h-[300px] transition-transform duration-300 transform hover:scale-105 border-1 border-gray-200 shadow-md bg-white rounded-lg p-6 cursor-pointer" 
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

                            <p className="text-gray-500 italic text-sm">{new Date(appointment.startDateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                            
                        <p className="text-slate-600 text-xl font-bold text-center">{appointment.service.name}</p>
                        
                        <div>
                            <p className="text-md font-semibold">{appointment.provider.name}</p>
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

export default ClientAppointments