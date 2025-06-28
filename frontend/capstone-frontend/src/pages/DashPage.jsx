import { useUser } from '../UserContext'
import ClientDashPage from './ClientDashPage'
import ProviderDashPage from './ProviderDashPage'

function DashPage() {
    const { user } = useUser()

    if(!user) {
        return <p>Not logged in.</p>
    }

    if(user.role === 'CLIENT') {
        return <ClientDashPage />
    }

    if(user.role === 'PROVIDER') {
        return <ProviderDashPage />
    }

    return <p>Invalid user role</p>
}

export default DashPage