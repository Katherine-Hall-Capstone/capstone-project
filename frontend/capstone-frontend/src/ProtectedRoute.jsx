import { Navigate } from 'react-router'
import { useUser } from './UserContext'
import LoadingSpinner from './LoadingState'

function ProtectedRoute({ children }) {
    const { user, loading } = useUser()

    if(loading) {
        return <LoadingSpinner />
    }
    
    if(!user) {
        // 'replace' so user can't go back to protected route after redirect
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute