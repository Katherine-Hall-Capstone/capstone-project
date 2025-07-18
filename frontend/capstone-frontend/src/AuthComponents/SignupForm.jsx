import { useState } from 'react'
import { useNavigate } from 'react-router'

function SignupForm() {
    const [formData, setFormData] = useState({ name: "", username: "", password: "", role: "", email: "" })
    const [message, setMessage] = useState({ type: '', text: '' })
    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setMessage('')

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if(!res.ok) {
                throw new Error(data.error || "Signup failed")
            }

            setMessage({ type: 'success', text: 'Signup successful! Redirecting you now...'})
            setFormData({ name: "", username: "", password: "", role: "", email: "" })

            // Waits 1 second to redirect user to Landing Page
            setTimeout(() => {
                navigate('/')
            }, 1000)
        } catch(error) {
            console.error("Error:", error)
            setMessage({ type: 'error', text: error.message })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white max-w-md mx-auto mt-10 p-9 shadow-md rounded-lg flex flex-col gap-4">
            <div className="flex flex-col gap-1 mb-5">
                <h1 className="text-3xl font-bold text-center">Create your account</h1>
                <p className="text-gray-400 text-center text-sm">Nice to meet you.</p>
            </div>

            <div>
                <label className="font-semibold">Name</label>
                <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} 
                    className="w-full border border-gray-300 rounded px-4 py-2 mt-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
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

            <div>
                <label className="font-semibold">Email</label>
                <input 
                    type="text" name="email" value={formData.email} onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 mt-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
            </div>

            <div>
                <label className="font-semibold">Select a Role</label>
                <select 
                    name="role" value={formData.role} onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-2 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                    <option value="">-</option>
                    <option value="CLIENT">Client</option>
                    <option value="PROVIDER">Provider</option>
                </select>
            </div>
            

            <button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-500 transition duration-200 mt-2 text-white font-semibold py-2 px-5 rounded-md cursor-pointer"
            >
                Sign Up
            </button>

            <p className={`text-center text-sm min-h-5 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
        </form>
    )
}

export default SignupForm

