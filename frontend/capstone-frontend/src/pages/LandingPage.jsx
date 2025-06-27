import { useNavigate } from 'react-router';

function LandingPage() {
    const navigate = useNavigate();

    return(
        <>
            <h1>Landing Page</h1>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
            <button onClick={() => navigate('/login')}>Log In</button>
        </>
    )
}

export default LandingPage