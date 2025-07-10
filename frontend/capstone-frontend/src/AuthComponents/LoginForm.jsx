import '../css/LoginForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useUser } from '../UserContext'


function LoginForm() {
    const [formData, setFormData] = useState({ username: "", password: "" })
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()
    const { setUser } = useUser()

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
            console.log("Login Success!")
            navigate('/dashboard') 
        } catch(error) {
            console.error("Error:", error)
            setErrorMessage(error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username"/>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" />

            <button type="submit" className="submit-button">Log In</button>

            {errorMessage && (<p className="error-msg">{errorMessage}</p>)}
        </form>
    );

}

export default LoginForm