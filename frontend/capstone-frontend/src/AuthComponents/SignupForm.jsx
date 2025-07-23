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
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-div">
                <h1 className="auth-header">Sign up for EasyPoint</h1>
                <p className="auth-message">Nice to meet you.</p>
            </div>

            <div>
                <label className="font-semibold">Name</label>
                <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} 
                    className="auth-textbox"
                />
            </div>

            <div>
                <label className="font-semibold">Username</label>
                <input 
                    type="text" name="username" value={formData.username} onChange={handleChange}
                    className="auth-textbox"
                />
            </div>

            <div>
                <label className="font-semibold">Password</label>
                <input 
                    type="password" name="password" value={formData.password} onChange={handleChange}
                    className="auth-textbox"
                />
            </div>

            <div>
                <label className="font-semibold">Email</label>
                <input 
                    type="text" name="email" value={formData.email} onChange={handleChange}
                    className="auth-textbox"
                />
            </div>

            <div>
                <label className="font-semibold">Select a Role</label>
                <select 
                    name="role" value={formData.role} onChange={handleChange}
                    className="auth-textbox cursor-pointer"
                >
                    <option value="">-</option>
                    <option value="CLIENT">Client</option>
                    <option value="PROVIDER">Provider</option>
                </select>
            </div>
            

            <button 
                type="submit" 
                className="primary-btn"
            >
                Sign Up
            </button>

            <p className={`message ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
        </form>
    )
}

export default SignupForm

