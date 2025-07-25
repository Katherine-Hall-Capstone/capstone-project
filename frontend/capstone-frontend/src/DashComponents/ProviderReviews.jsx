import { useEffect, useState } from 'react'

function ProviderReviews() {
    const [providerReviews, setProviderReviews] = useState([])

    async function fetchProviderReviews() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setProviderReviews(data)
            } else {
                console.error('Failed to fetch provider reviews')
            }
        } catch(error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProviderReviews()
    }, [])

    return(
        <div className="p-15">
            <h3 className="dash-title">My Reviews</h3>

            <div className="mt-8 mx-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 justify-center">
                {providerReviews.length === 0 ? (
                    <p className="mt-3">No reviews yet.</p>
                ) : (
                    <>
                        {providerReviews.map(review => (
                            <div key={review.id} className="flex flex-col gap-1 p-5 h-auto bg-gray-200 border border-gray-400 shadow-md rounded-md">
                                <p><span className="font-semibold">Client: </span>{review.client.name}</p>
                                <p><span className="font-semibold">Service: </span>{review.service.name}</p>
                                <p><span className="font-semibold">Rating: </span>{review.rating}/5</p>
                                <p className="break-words"><span className="font-semibold">Comment: </span>{review.comment || 'N/A'}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default ProviderReviews