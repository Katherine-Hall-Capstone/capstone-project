import AuthPage from "./AuthPage"
import SignupForm from "../AuthComponents/SignupForm"

function SignupPage() {
    return (
        <AuthPage path="/login" label="Log in instead?">
            <SignupForm />
        </AuthPage>
    )
}

export default SignupPage