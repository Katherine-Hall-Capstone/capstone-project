import { useNavigate } from 'react-router';
import { useUser } from '../UserContext'

function LandingPage() {
    const navigate = useNavigate();
    const { user } = useUser();

    return(
        <>
            <h1>Landing Page</h1>
            {user ? (
                <p>Welcome, {user.username}!</p>
            ) : (
                <>
                <button onClick={() => navigate('/signup')}>Sign Up</button>
                <button onClick={() => navigate('/login')}>Log In</button>
                </>
            )}
        </>
    )
}

export default LandingPage