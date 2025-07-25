import { useUser } from '../UserContext'

export function useRefreshUser() {
    const { setUser } = useUser()

    async function refreshUser() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                credentials: 'include'
            })

            if(res.ok) {
                const data = await res.json()

                // If ID field exists, user is already logged in
                if (data.id) {
                    setUser(data)
                }
            } else {
                console.error('Failed to refresh:')
            }
        } catch (error) {
            console.error('Error: ', error)
        }
    }

    return refreshUser
}