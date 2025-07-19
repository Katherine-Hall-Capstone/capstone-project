import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GoArrowRight } from 'react-icons/go'

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
            <div className="flex justify-center pt-12">
                <form onSubmit={handleSearch} className="flex gap-4 text-white bg-slate-900 px-4 py-3 rounded-3xl w-120">
                    <input 
                        type="text"
                        placeholder="Search for Providers"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="focus:outline-none text-white w-80 px-2 placeholder-white"
                    />
                    <div className="flex flex-row gap-2">
                        <button type="button" onClick={handleClear} className="cursor-pointer">Clear</button>
                        <button type="submit" className="bg-white text-black px-3 py-2 rounded-2xl cursor-pointer">Search</button>
                    </div>
                </form>
            </div>

            <div className="flex justify-center mt-12">
                {status === 'unrun' && <p>Search for providers.</p>}
                {status === 'loading' && <p>Loading...</p>}
                {status === 'error' && <p>Something went wrong.</p>}
                {status === 'success' && results.length === 0 && <p>No matches found.</p>}
                {status === 'success' && results.length > 0 && (
                    <div className="max-h-[600px] overflow-y-auto space-y-4">
                        {results.map(provider => (
                            <div 
                                key={provider.id}
                                className="bg-gray-100 p-4 rounded-xl w-160 flex flex-row justify-between"
                            >
                                <div className="space-y-2">
                                    <p className="font-bold text-xl">{provider.name}</p>
                                    <p className="italic"><span className="font-medium">Services: </span>{provider.servicesOffered?.map(service => service.name).join(', ')}</p>
                                </div>
                                <button onClick={() => navigate(`/providers/${provider.id}`)} className="flex items-center gap-2 cursor-pointer">See More <GoArrowRight /></button>
                            </div>
                        ))}
                    </div>

                    
                    
                    
                )} 
            </div> 
        </div>
    )
}

export default ClientSearchForm