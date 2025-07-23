import { useNavigate } from 'react-router'

function AuthPage({ children, path, label }) {
    const navigate = useNavigate()

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="flex items-center justify-between py-4 px-8 bg-white border-b-2 border-gray-300">
                <button
                    onClick={() => navigate('/')}
                    className="logo cursor-pointer"
                >
                    EasyPoint
                </button>

                <button 
                    onClick={() => navigate(path)}
                    className="primary-btn"
                >
                    {label}
                </button>
            </header>

            <div className="flex flex-col justify-center min-h-screen">
                {children}
            </div>
        </div>
    )
}

export default AuthPage