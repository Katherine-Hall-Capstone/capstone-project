import '../css/SignupPage.css'
import SignupForm from "../AuthComponents/SignupForm"

function SignupPage() {
    return(
        <div className="signup-page">
            <div className="form-container">
                <h1 className="signup-title">Sign Up</h1>
                <SignupForm></SignupForm>
            </div>
        </div>
    )
}

export default SignupPage