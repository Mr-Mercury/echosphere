import { AuthCardWrapper } from "./auth-card-wrapper";
import { FaExclamationTriangle } from "react-icons/fa";

export const ErrorCard = () => {
    return (
        <AuthCardWrapper 
        headerLabel='Oh dear, something went wrong!'
        backButtonHref='/login'
        backButtonLabel='Return to login screen'>
            <div className='w-full flex justify-center items-center'>
                <FaExclamationTriangle className='text-destructive'/>
            </div>
        </AuthCardWrapper>
    )
}