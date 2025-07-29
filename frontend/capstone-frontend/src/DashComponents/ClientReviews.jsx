import { useEffect, useState } from 'react'

const starRatings = [1, 2, 3, 4, 5]

function ClientReviews() {
    const [providers, setProviders] = useState([])
    const [selectedProviderId, setSelectedProviderId] = useState(null)
    const [services, setServices] = useState([])
    const [formData, setFormData] = useState({ serviceId: '', rating: '', comment: '' })
    const [clientReviews, setClientReviews] = useState([])

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
            console.error('Error: ', error)
        }
    }

    async function fetchClientReviews() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setClientReviews(data)
            } else {
                console.error('Failed to fetch client reviews')
            }
        } catch(error) {
            console.error('Error: ', error)
        }
    }

    useEffect(() => {
        fetchProviders()
        fetchClientReviews()
    }, [])

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
        loadProviderServices(selectedProviderId, providers, setServices, setFormData)
    }, [selectedProviderId, providers])

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        if(!selectedProviderId || !formData.serviceId || !formData.rating) {
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
                fetchClientReviews()
                setSelectedProviderId(null)
                setServices([])
                setFormData({ serviceId: '', rating: '', comment: '' })
            } else {
                console.error('Review submission failed')
            }
        } catch(error) {
            console.error(error)
        }
    }
    
    return(
        <div className="p-15">
            <h3 className="dash-title">My Reviews</h3>

            <div className="flex flex-col gap-10 md:flex-row justify-around mt-8 mx-6 ">
                <div>
                    <p className="dash-header">Write a Review</p>
                    <div className="flex flex-col gap-4 w-100 mt-5 p-7 bg-gray-100 border border-gray-300 shadow-xl rounded-lg">
                        <label>
                            <p>Provider:</p>
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
                            <form 
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4"
                            >
                                <label>
                                    <p>Service: </p>
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
                                    <p>Rating: </p>
                                    <select
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        className="client-pref-box"
                                        required
                                    >
                                        <option value="">--</option>
                                        {starRatings.map(num => (
                                            <option key={num} value={num}>{num} Star</option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    <p>Comment (Optional):</p>
                                    <textarea
                                        name="comment"
                                        value={formData.comment}
                                        onChange={handleChange}
                                        className="p-1 bg-white w-full min-h-45 border border-gray-300 focus:outline-none focus:ring-1 rounded-md resize-none"
                                    />
                                </label>

                                <button type="submit" className="primary-btn">Submit Review</button>
                            </form>
                        )}
                    </div>
                </div>
                
                <div>
                    <p className="dash-header">Past Reviews</p>
                    <div className="mt-5 p-5 w-125 border border-gray-300 bg-gray-100 shadow-xl rounded-md">
                        {clientReviews.length === 0 ? (
                            <p>No reviews yet.</p>
                        ) : (
                            <ul className="space-y-5">
                                {clientReviews.map(review => (
                                    <li key={review.id} className="flex flex-col gap-1 p-2 bg-gray-200 border border-gray-400 shadow-md rounded-md">
                                        <p><span className="font-semibold">Provider: </span>{review.provider.name}</p>
                                        <p><span className="font-semibold">Service: </span>{review.service.name}</p>
                                        <p><span className="font-semibold">Rating: </span>{review.rating}/5</p>
                                        <p className="break-words"><span className="font-semibold">Comment: </span>{review.comment || 'N/A'}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientReviews
