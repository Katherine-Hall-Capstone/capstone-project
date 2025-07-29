import { useParams, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { TbArrowBackUp } from "react-icons/tb"

function ProviderPageReviews() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [providerReviews, setProviderReviews] = useState([])

    async function fetchReviews(){
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setProviderReviews(data)
            } else {
                console.error('Failed to fetch provider reviews')
            }
        } catch(error) {
            console.error('Error: ', error)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [id])

    return(
        <div className="p-15" >
            <div className="text-left">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 mb-4 hover:underline hover:font-semibold cursor-pointer"
                >
                    <TbArrowBackUp className="text-xl"/>
                    <span>Back to Provider Profile</span>
                </button>
            </div>

            <h3 className="dash-title text-center">Reviews for Provider</h3>

            <div className="mt-8 mx-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 justify-center">
                {providerReviews.map(review => (
                    <div key={review.id} className="flex flex-col gap-1 p-5 h-auto bg-gray-200 border border-gray-400 shadow-md rounded-md">
                        <p><span className="font-semibold">Client: </span>{review.client.name}</p>
                        <p><span className="font-semibold">Service: </span>{review.service.name}</p>
                        <p><span className="font-semibold">Rating: </span>{review.rating}/5</p>
                        <p className="break-words"><span className="font-semibold">Comment: </span>{review.comment || 'N/A'}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProviderPageReviews