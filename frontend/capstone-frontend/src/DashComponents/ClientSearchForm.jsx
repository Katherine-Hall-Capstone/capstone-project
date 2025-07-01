import { useState } from 'react'
import { useNavigate } from 'react-router'

function ClientSearchForm() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [status, setStatus] = useState('unrun')
    const navigate = useNavigate()

    async function handleSearch(event) {
        event.preventDefault()
        if(query.trim() === '') {
            return
        }

        setStatus('loading')

        try {   
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers?search=${encodeURIComponent(query)}`)
            
            if(res.ok) {
                const data = await res.json()
                setResults(data)
                setStatus('success')
            } else {
                console.error('Failed to search for providers')
                setResults([])
                setStatus('error')
            }
        } catch(error) {
            console.error(error)
            setResults([])
            setStatus('error')
        }
    }

    function handleClear() {
        setQuery('')
        setResults([])
        setStatus('unrun')
    }

    return(
        <div>
            <form onSubmit={handleSearch}>
                <input 
                    type="text"
                    placeholder="Search providers by name"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <button type="submit">Search</button>
                <button type="button" onClick={handleClear}>Clear</button>
            </form>

            {status === 'unrun' && <p>Search for providers.</p>}
            {status === 'loading' && <p>Loading...</p>}
            {status === 'error' && <p>Something went wrong.</p>}
            {status === 'success' && results.length === 0 && <p>No matches found.</p>}
            {status === 'success' && results.length > 0 && (
                <ul>
                    {results.map(provider => (
                    <li key={provider.id}>
                        {provider.name} – {provider.servicesOffered?.join(', ')}
                        <button onClick={() => navigate(`/providers/${provider.id}`)}>See More</button>
                    </li>
                    ))}
                </ul>
            )}  
                
        </div>
    )
}

export default ClientSearchForm