import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useUser } from '../UserContext'


function LoginForm() {
    const [formData, setFormData] = useState({ username: "", password: "" })
    const [errorMessage, setErrorMessage] = useState('')
    const { setUser } = useUser()
    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if(!res.ok) {
                throw new Error(data.error || "Login failed")
            }

            setUser(data)
            setFormData({ username: "", password: "" })
            navigate('/dashboard') 
        } catch(error) {
            console.error("Error:", error)
            setErrorMessage(error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white max-w-md mx-auto mt-10 p-9 shadow-md rounded-lg flex flex-col gap-4">
            <div className="flex flex-col gap-1 mb-5" >
                <h1 className="text-3xl font-bold text-center">Log in to your account</h1>
                <p className="text-gray-400 text-center text-sm">Good to see you again.</p>
            </div>
            
            <div>
                <label className="font-semibold">Username</label>
                <input 
                    type="text" name="username" value={formData.username} onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 mt-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
            </div>
            
            <div>
                <label className="font-semibold">Password</label>
                <input 
                    type="password" name="password" value={formData.password} onChange={handleChange} 
                    className="w-full border border-gray-300 rounded px-4 py-2 mt-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
            </div>
            

            <button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-500 transition duration-200 mt-2 text-white font-semibold py-2 px-5 rounded-md cursor-pointer"
            >
                Log In
            </button>

            <p className="text-red-600 text-center text-sm min-h-5">{errorMessage}</p>
        </form>   
    )

}

export default LoginForm