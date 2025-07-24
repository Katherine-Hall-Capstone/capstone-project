import { useEffect, useState } from 'react'

function ClientReviews() {
    const [providers, setProviders] = useState([])
    const [selectedProviderId, setSelectedProviderId] = useState(null)
    const [services, setServices] = useState([])
    const [formData, setFormData] = useState({ serviceId: '', rating: '', comment: '' })
    const [message, setMessage] = useState('')

    async function fetchProviders() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/review-valid`, {
                credentials: 'include'
            })

            if(!res.ok) {
                console.error('Failed to fetch providers')
            } else {
                const data = await res.json()

                const uniqueProviders = []
                const seenProviderIds = new Set()

                data.forEach(appointment => {
                    if(!seenProviderIds.has(appointment.provider.id)) {
                        seenProviderIds.add(appointment.provider.id)
                        uniqueProviders.push(appointment.provider)
                    }
                })

                setProviders(uniqueProviders)
            }
        } catch(error) {
            console.error(error)
        }
    }

    function loadProviderServices(selectedProviderId, providers, setServices, setFormData) {
        if(!selectedProviderId) {
            setServices([])
            setFormData(prev => ({ ...prev, serviceId: '' }))
            return
        } 

        const provider = providers.find(p => p.id === parseInt(selectedProviderId))

        if(provider && provider.servicesOffered) {
            setServices(provider.servicesOffered)
        } else {
            setServices([])
        }
    }

    useEffect(() => {
        fetchProviders()
    }, [])

    useEffect(() => {
        loadProviderServices(selectedProviderId, providers, setServices, setFormData)
    }, [selectedProviderId, providers])

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setMessage('')
        if(!selectedProviderId || !formData.serviceId || !formData.rating) {
            setMessage('Must select a provider, service, and rating')
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                credentials: 'include', 
                body: JSON.stringify({
                    providerId: parseInt(selectedProviderId),
                    serviceId: parseInt(formData.serviceId),
                    rating: parseInt(formData.rating),
                    comment: formData.comment
                })
            })

            if(res.ok) {
                setMessage('Review submitted!')
                setSelectedProviderId(null)
                setServices([])
                setFormData({ serviceId: '', rating: '', comment: '' })
            } else {itrikcnedglvjdkdv
                setMessage('Failed to submit review')
                console.error('Review submission failed')
            }
        } catch(error) {
            console.error(error)
        }
    }

    
    return(
        <div className="p-15">
            <h3 className="dash-title">My Reviews</h3>

            <label>
                Provider:
                <select
                    value={selectedProviderId || ''}
                    onChange={event => setSelectedProviderId(event.target.value)}
                    className="client-pref-box"
                >
                    <option value="">--</option>
                    {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </label>

            {selectedProviderId && (
                <form onSubmit={handleSubmit}>
                    <label>
                        Service:
                        <select
                            name="serviceId"
                            value={formData.serviceId}
                            onChange={handleChange}
                            className="client-pref-box"
                            required
                        >
                            <option value="">--</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Rating:
                        <select
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            className="client-pref-box"
                            required
                        >
                            <option value="">--</option>
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num} Star</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Comment (Optional):
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            className=""
                        />
                    </label>

                    <button type="submit" className="primary-btn">Submit Review</button>
                </form>
            )}
        </div>
    )
}

export default ClientReviews
