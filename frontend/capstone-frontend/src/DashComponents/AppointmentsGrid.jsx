import { useState } from 'react'
import AppointmentDetailsModal from './AppointmentDetailsModal'
import { IoMailUnread } from "react-icons/io5"
import { IoMailOpenOutline } from "react-icons/io5"

function AppointmentsGrid({ appointments, role, onRead }) {
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const showModal = selectedAppointment !== null

    function handleOpenModal(appointment) {
        setSelectedAppointment(appointment)
    }

    function handleCloseModal() {
        setSelectedAppointment(null)
    }

    return(
        <>
            <div className="mt-8 mx-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center">
                {appointments.map(appointment => (
                    <div 
                        key={appointment.id} 
                        className={`flex flex-col justify-between h-[300px] p-6 transition-transform duration-300 transform hover:scale-105 border-1 ${role === 'provider' ? appointment.isUnread ? 'border-gray-300 bg-gray-200' : 'border-gray-200 bg-white' : 'border-gray-200 bg-white'} shadow-md rounded-lg cursor-pointer`}
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

                            <p className="dash-message text-sm">{new Date(appointment.startDateTime).toLocaleString(undefined, {
                                    month: 'short', 
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                            
                        <p className="text-slate-600 text-xl text-center font-bold">{appointment.service.name}</p>
                        
                        {role === 'client' && (
                            <p className="font-semibold">Provider: <span className="font-normal">{appointment.provider.name}</span></p>
                        )}
                        
                        {role === 'provider' && (
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">Client: <span className="font-normal">{appointment.client.name}</span></p>
    
                                <button 
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        onRead(appointment.id)
                                    }}
                                    className="text-2xl cursor-pointer"
                                >
                                    {appointment.isUnread ? <IoMailUnread /> : <IoMailOpenOutline />}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModal && selectedAppointment && (
                <AppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={handleCloseModal}
                />
            )}
        </>
    )
}

export default AppointmentsGrid