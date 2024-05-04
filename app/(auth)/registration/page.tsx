import { AuthCardWrapper } from "@/components/auth-components/auth-card-wrapper";
import { RegistrationForm } from "@/components/auth-components/registration-form";

const RegistrationPage = () => {
    return (
        <AuthCardWrapper headerLabel='Create an account' 
        backButtonLabel="Already have an account?" 
        backButtonHref='/login'
        showSocial={true}>
            <RegistrationForm>
            </RegistrationForm>
        </AuthCardWrapper>
    )
}

export default RegistrationPage;