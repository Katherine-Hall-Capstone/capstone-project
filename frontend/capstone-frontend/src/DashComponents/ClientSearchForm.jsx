import { useState } from 'react'
import { useNavigate } from 'react-router'

function ClientSearchForm() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searched, setSearched] = useState(false)
    const navigate = useNavigate()

    async function handleSearch(event) {
        event.preventDefault()
        if(query.trim() === '') {
            return
        }

        try {   
            const res = await fetch(`${import.meta.env.VITE_API_URL}/providers?search=${encodeURIComponent(query)}`)
            
            if(res.ok) {
                const data = await res.json()
                setResults(data)
                setSearched(true)
            } else {
                console.error('Failed to search for providers')
            }
        } catch(error) {
            console.error(error)
            setResults([])
            setSearched(true)
        }
    }

    function handleClear() {
        setQuery('')
        setResults([])
        setSearched(false)
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

            {searched && results.length === 0 && <p>No matches found.</p>}

            <ul>
                {results.map(provider => (
                <li key={provider.id}>
                    {provider.name} – {provider.servicesOffered?.join(', ')}
                    <button onClick={() => navigate(`/providers/${provider.id}`)}>See More</button>
                </li>
                ))}
            </ul>
        </div>
    )
}

export default ClientSearchForm