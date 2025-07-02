import '../css/LoginPage.css'
import LoginForm from "../AuthComponents/LoginForm"

function LoginPage() {
    return(
        <div className="login-page">
            <div className="form-container">
                <h1 className="login-title">Log In</h1>
                <LoginForm></LoginForm>
            </div>
        </div>
    )
}

export default LoginPage