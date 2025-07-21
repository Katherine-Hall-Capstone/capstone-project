import SignupForm from "../AuthComponents/SignupForm"
import { useNavigate } from 'react-router'

function SignupPage() {
    const navigate = useNavigate()

    return(
        <div className="bg-gray-100 min-h-screen">
            <header className="border-b-2 border-gray-300 bg-white py-4 px-8 flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="text-xl font-bold text-slate-900 cursor-pointer"
                >
                    EasyPoint
                </button>

                <button 
                    onClick={() => navigate('/login')}
                    className="bg-slate-900 hover:bg-slate-600 transition duration-200 text-white font-semibold py-2 px-6 rounded-md cursor-pointer"
                >
                    Log in instead?
                </button>
            </header>

            <div className="min-h-screen flex flex-col justify-center">
                <SignupForm></SignupForm>
            </div>
        </div>
        
    )
}

export default SignupPage