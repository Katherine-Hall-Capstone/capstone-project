import { useParams } from 'react-router'
import { useEffect, useState } from 'react'

function ProviderPageClientView() {
    const { id } = useParams()
    const [provider, setProvider] = useState(null)

    async function fetchProvider(){
        try {
            const res = await fetch(`http://localhost:3000/providers/${id}`)

            if(res.ok) {
                const data = await res.json()
                setProvider(data); 
            } else {
                console.error('Failed to fetch provider')
            }
        } catch(error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProvider()
    }, [id])

    if (!provider) {
        return <p>Provider does not exist</p>
    }

    return(
        <div>
            <h2>Provider Profile</h2>
            <p>ID: {provider.id}</p>
            <p>Name: {provider.name}</p>
            <p>Services: {provider.servicesOffered?.join(', ')}</p>
        </div>
    )
}

export default ProviderPageClientView