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
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-div">
                <h1 className="auth-header">Log in to EasyPoint</h1>
                <p className="auth-message">Good to see you again.</p>
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
            
            <button 
                type="submit" 
                className="primary-btn"
            >
                Log In
            </button>

            <p className="message text-red-600">{errorMessage}</p>
        </form>   
    )

}

export default LoginForm