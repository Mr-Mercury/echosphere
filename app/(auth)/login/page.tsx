import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/islets/auth/auth-button";
import { AuthCardWrapper } from "@/components/auth-components/auth-card-wrapper";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/components/auth-components/login-form";


const LoginPage = () => {
    return (
        <AuthCardWrapper headerLabel='Login Page' 
        backButtonLabel="Don't have an account?" 
        backButtonHref='/registration'
        showSocial={true}>
            <LoginForm>
            </LoginForm>
        </AuthCardWrapper>
    )
}

export default LoginPage;