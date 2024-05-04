import { AuthCardWrapper } from "@/components/auth-components/auth-card-wrapper";
import { LoginForm } from "@/components/auth-components/login-form";

const RegistrationPage = () => {
    return (
        <AuthCardWrapper headerLabel='Echosphere' 
        backButtonLabel="Already have an account?" 
        backButtonHref='/login'
        showSocial={true}>
            <LoginForm>
            </LoginForm>
        </AuthCardWrapper>
    )
}

export default RegistrationPage;