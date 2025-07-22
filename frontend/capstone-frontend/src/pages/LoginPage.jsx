import LoginForm from "../AuthComponents/LoginForm"
import { useNavigate } from 'react-router'

function LoginPage() {
    const navigate = useNavigate()
    
    return(
        <div className="bg-gray-100 min-h-screen">
            <header className="flex items-center justify-between py-4 px-8 bg-white border-b-2 border-gray-300">
                <button
                    onClick={() => navigate('/')}
                    className="text-xl font-bold text-slate-900 cursor-pointer"
                >
                    EasyPoint
                </button>
                
                <button 
                    onClick={() => navigate('/signup')}
                    className="py-2 px-6 bg-slate-900 hover:bg-slate-600 transition duration-200 text-white font-semibold rounded-md cursor-pointer"
                >
                    Sign up instead?
                </button>
            </header>

            <div className="flex flex-col justify-center min-h-screen">
                <LoginForm />
            </div>
        </div>
        
    )
}

export default LoginPage