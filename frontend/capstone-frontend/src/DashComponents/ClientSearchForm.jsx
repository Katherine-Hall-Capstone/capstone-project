import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GoArrowRight } from 'react-icons/go'
import LoadingSpinner from '../LoadingState'
import { LOADING_IN_MS } from '../constants'

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

            await new Promise(resolve => setTimeout(resolve, LOADING_IN_MS))  // Force loading state
            
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
                <form onSubmit={handleSearch} className="flex gap-4 px-4 py-3 bg-slate-900 w-120 text-white rounded-3xl">
                    <input 
                        type="text"
                        placeholder="Search for Providers"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="px-2 w-80 focus:outline-none text-white"
                    />
                    <div className="flex flex-row gap-2">
                        <button type="button" onClick={handleClear} className="cursor-pointer">Clear</button>
                        <button type="submit" className="px-3 py-2 bg-white text-black rounded-2xl cursor-pointer">Search</button>
                    </div>
                </form>
            </div>

            <div className="flex justify-center mt-12">
                {status === 'unrun' && <p>Search for providers.</p>}
                {status === 'loading' && <LoadingSpinner />}
                {status === 'error' && <p>Something went wrong.</p>}
                {status === 'success' && results.length === 0 && <p>No matches found.</p>}
                {status === 'success' && results.length > 0 && (
                    <div className="max-h-[600px] overflow-y-auto space-y-4">
                        {results.map(provider => (
                            <div 
                                key={provider.id}
                                className="flex flex-row justify-between p-4 bg-gray-100 w-160 rounded-xl"
                            >
                                <div className="space-y-2">
                                    <p className="text-xl font-bold">{provider.name}</p>
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