import { useState, useEffect } from 'react'
import { FaTrashAlt } from "react-icons/fa"

function ProviderServices({ providerId }) {
    const [services, setServices] = useState([])
    const [serviceName, setServiceName] = useState('')
    const [serviceDuration, setServiceDuration] = useState('')
    const [serviceDetails, setServiceDetails] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    async function fetchServices() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${providerId}/services`, {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                setServices(data.sort((a, b) => a.name.localeCompare(b.name)))
            } else {
                console.error('Failed to fetch services')
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [providerId])

    async function handleAddService(event) {
        event.preventDefault()
        setErrorMessage('')

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${providerId}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: serviceName,
                    duration: parseInt(serviceDuration),
                    details: serviceDetails 
                })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to add service')
            }

            fetchServices()
            setServiceName('')
            setServiceDuration('')
            setServiceDetails('')
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        }
    }

    async function handleDeleteService(serviceId) {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${providerId}/services/${serviceId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            const data = await res.json()
            if(!res.ok) {
                throw new Error(data.error || 'Failed to delete service')
            }
            fetchServices()
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        }
    }

    return (
        <div>
            <h3 className="provider-pref-title">Manage Services</h3>

            <div className="flex justify-around">
                <div>
                    <p className="provider-pref-header">Add Service:</p>
                    <form 
                        onSubmit={handleAddService}
                        className="flex flex-col gap-2 mt-3"
                    >
                        <input
                            type="text"
                            placeholder="Service Name"
                            value={serviceName}
                            onChange={event => setServiceName(event.target.value)}
                            className="provider-serv-text"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Duration (min)"
                            value={serviceDuration}
                            onChange={event => setServiceDuration(event.target.value)}
                            className="provider-serv-text"
                            required
                            min={1}
                        />
                        <textarea
                            placeholder="Service Details"
                            value={serviceDetails}
                            onChange={event => setServiceDetails(event.target.value)}
                            className="provider-serv-text h-40 resize-none"
                        />
                        <button 
                            type="submit"
                            className="primary-btn mt-4"
                        >
                            Add Service
                        </button>
                    </form>

                    <p className="message mt-2 max-w-50 text-red-600">{errorMessage}</p>
                </div>

                <div>
                    <p className="provider-pref-header">Services</p>
                    <ul className="mt-3 w-70 space-y-4">
                        {services.map(service => (
                            <li key={service.id} className="provider-pref-list flex-col">
                                <div className="font-bold">{service.name} ({service.duration} min):</div> 
                                <div className="w-full italic break-words text-center text-slate-200">{service.details}</div>
                                <button 
                                    onClick={() => handleDeleteService(service.id)}
                                    className="mt-2 cursor-pointer"
                                >
                                    <FaTrashAlt />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ProviderServices