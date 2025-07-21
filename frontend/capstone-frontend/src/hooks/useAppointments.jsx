import { useEffect, useState } from 'react'

export function useAppointments() {
    const [appointments, setAppointments] = useState([])
    const [status, setStatus] = useState('unrun')

    async function fetchAppointments() {
        setStatus('loading')
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
                credentials: 'include'
            })

            await new Promise(resolve => setTimeout(resolve, 3000))  // Force a loading state

            if(res.ok) {
                const data = await res.json()
                setAppointments(data.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)))
                setStatus('success')
            } else {
                console.error('Failed to fetch appointments')
                setStatus('error')
            }
        } catch(error) {
            console.error(error) 
            setStatus('error')
        } 
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    return { appointments, setAppointments, status }
}