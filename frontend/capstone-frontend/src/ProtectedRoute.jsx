import { Navigate } from 'react-router'
import { useUser } from './UserContext'

function ProtectedRoute({ children }) {
    const { user, loading } = useUser()

    if(loading) {
        return <p>Loading...</p>
    }
    
    if(!user) {
        // 'replace' so user can't go back to protected route after redirect
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute