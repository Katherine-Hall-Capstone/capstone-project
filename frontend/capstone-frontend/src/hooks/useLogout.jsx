import { useNavigate } from 'react-router'
import { useUser } from '../UserContext'

export function useLogout() {
    const { setUser } = useUser()
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })

            if(res.ok) {
                setUser(null)
                navigate('/')
            } else {
                console.error('Logout failed')
            }
        } catch(error) {
            console.error('Error: ', error)
        }
    }

    return handleLogout
}