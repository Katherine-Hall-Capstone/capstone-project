import { useState, useEffect } from 'react'

function ProviderServices({ providerId }) {
    const [services, setServices] = useState([])
    const [serviceName, setServiceName] = useState('')
    const [serviceDuration, setServiceDuration] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    async function fetchServices() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers/${providerId}/services`, {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                setServices(data)
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
                    duration: parseInt(serviceDuration)
                })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to add service')
            }

            fetchServices()
            setServiceName('')
            setServiceDuration('')
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

            if (res.ok) {
                fetchServices()
            } else {
                console.error('Failed to delete service')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="service-container">
            <h3>Manage Services</h3>
            <form onSubmit={handleAddService}>
                <input
                    type="text"
                    placeholder="Service Name"
                    value={serviceName}
                    onChange={event => setServiceName(event.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Duration (min)"
                    value={serviceDuration}
                    onChange={event => setServiceDuration(event.target.value)}
                    required
                    min={1}
                />
                <button type="submit">Add Service</button>
            </form>

            <ul>
                {services.map(service => (
                    <li key={service.id}>
                        {service.name} ({service.duration} min)
                        <button onClick={() => handleDeleteService(service.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {errorMessage && <p className="error-msg">{errorMessage}</p>}
        </div>
    )
}

export default ProviderServices