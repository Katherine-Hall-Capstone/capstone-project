import { useNavigate } from 'react-router'

function LandingPage() {
    const navigate = useNavigate()

    return(
        <>
            <header className="flex items-center justify-between py-4 px-8 border-b-2 border-gray-300">
                <h2 className="logo">EasyPoint</h2>
                <button 
                    onClick={() => navigate('/login')}
                    className="primary-btn"
                >
                    Log In
                </button>
            </header>

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="mb-8 text-4xl text-slate-900 font-bold">Welcome!</h1>
                
                <button 
                    onClick={() => navigate('/signup')}
                    className="primary-btn"
                >
                    Sign Up
                </button>
            </div>

            <footer className="flex justify-between py-4 px-8 border-t-2 border-gray-300">
                <h3>Est. 2025 @ Meta</h3>
                <h3>Katherine Hall</h3>
            </footer>
        </>
    )
}

export default LandingPage