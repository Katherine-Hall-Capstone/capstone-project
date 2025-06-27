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

    function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')
        
        fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(formData)
        })
            .then(response => {
                if(!response.ok) {
                    throw new Error("Login failed")
                }
                return response.json()
            })
            .then(data => {
                setUser(data)
                setFormData({ username: "", password: "" })
                console.log("Login Success!")
                navigate('/') // TODO: (Placeholder for now) Navigate to account's dashboard
            })
            .catch(error => {
                setErrorMessage("Invalid username or password")
                console.error("Error:", error)
            })
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