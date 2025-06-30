import { useState } from 'react'

function ClientSearchForm() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searched, setSearched] = useState(false)

    async function handleSearch(event) {
        event.preventDefault()
        if(query.trim() === '') {
            return
        }

        const res = await fetch(`http://localhost:3000/providers?search=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setSearched(true)
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
                </li>
                ))}
            </ul>
        </div>
    )
}

export default ClientSearchForm