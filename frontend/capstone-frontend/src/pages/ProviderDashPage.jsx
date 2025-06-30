import { useNavigate } from 'react-router'
import { useUser } from '../UserContext'

function ProviderDashPage() {
    const navigate = useNavigate()
    const { setUser } = useUser()

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
            console.error(error)
        }
    }


    return(
        <>  
            <button onClick={handleLogout}>Logout</button>

            <h2>Welcome Provider</h2>
        </>
    )
}

export default ProviderDashPage