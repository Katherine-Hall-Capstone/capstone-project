import AuthPage from "./AuthPage"
import LoginForm from "../AuthComponents/LoginForm"

function LoginPage() { 
    return(
        <AuthPage path="/signup" label="Sign up instead?" >
            <LoginForm />
        </AuthPage>
    )
}

export default LoginPage