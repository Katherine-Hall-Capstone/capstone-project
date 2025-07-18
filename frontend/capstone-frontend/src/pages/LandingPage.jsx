import { useNavigate } from 'react-router'

function LandingPage() {
    const navigate = useNavigate()

    return(
        <>
            <header className="border-b-2 border-gray-300 py-4 px-8 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">EasyPoint</h2>
                <button 
                    onClick={() => navigate('/login')}
                    className="bg-slate-900 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-md cursor-pointer"
                >
                    Log In
                </button>
            </header>

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-4xl font-bold mb-8 text-slate-900">Welcome!</h1>
                
                <div className="landing-btns">
                    <button 
                        onClick={() => navigate('/signup')}
                        className="bg-slate-900 hover:bg-slate-600 text-white font-semibold py-2 px-5 rounded-md cursor-pointer"
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            <footer className="border-t-2 border-gray-300 py-4 px-8 flex flex-row justify-between">
                <h3>Est. 2025 @ Meta</h3>
                <h3>Katherine Hall</h3>
            </footer>
        </>
    )
}

export default LandingPage