import '../css/SignupForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router'

function SignupForm() {
    const [formData, setFormData] = useState({ name: "", username: "", password: "", role: "", email: "" })
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSuccessMessage('')
        setErrorMessage('')

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

            setSuccessMessage("Signup successful! Redirecting you now...")
            setFormData({ name: "", username: "", password: "", role: "", email: "" })
            
            // Waits 2 seconds to redirect user to Landing Page
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch(error) {
            console.error("Error:", error)
            setErrorMessage(error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name"/>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username"/>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" />
            <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="Email"/>
            <select name="role" value={formData.role} onChange={handleChange}>
                <option value="">Select a Role</option>
                <option value="CLIENT">Client</option>
                <option value="PROVIDER">Provider</option>
            </select>

            <button type="submit" className="submit-button">Sign Up</button>

            {successMessage && (<p className="success-msg">{successMessage}</p>)}
            {errorMessage && (<p className="error-msg">{errorMessage}</p>)}
        </form>
    );

}

export default SignupForm

