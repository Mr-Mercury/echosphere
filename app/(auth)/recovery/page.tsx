import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/islets/auth/auth-button";
import { AuthCardWrapper } from "@/components/auth-components/auth-card-wrapper";
import { cn } from "@/lib/utils";
import RecoveryForm from "@/components/auth-components/recovery-form";

const LoginPage = () => {
    return (
        <AuthCardWrapper headerLabel='Recovery ' 
        backButtonLabel="Don't have an account?" 
        backButtonHref='/registration'
        showSocial={true}>
            <RecoveryForm>
            </RecoveryForm>
        </AuthCardWrapper>
    )
}

export default LoginPage;