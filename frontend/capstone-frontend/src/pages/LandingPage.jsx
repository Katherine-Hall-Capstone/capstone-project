import '../css/LandingPage.css'
import { useNavigate } from 'react-router'

function LandingPage() {
    const navigate = useNavigate()

    return(
        <>
            <header className="site-header">
                <h2>Header</h2>
            </header>

            <div className="landing-container">
                <h1>Welcome!</h1>
                
                <div className="landing-btns">
                    <button onClick={() => navigate('/signup')}>Sign Up</button>
                    <button onClick={() => navigate('/login')}>Log In</button>
                </div>
            </div>

            <footer className="site-footer">
                <h3>Footer</h3>
            </footer>
        </>
    )
}

export default LandingPage