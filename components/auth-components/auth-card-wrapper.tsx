'use client'

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { AuthHeader } from "./auth-header";
import { AuthSocial } from "@/components/islets/auth/auth-social";
import { AuthBackButton } from "./auth-back-button";

interface AuthCardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
}

export const AuthCardWrapper = ({ 
    children, 
    headerLabel, 
    backButtonLabel, 
    backButtonHref, 
    showSocial
}: AuthCardWrapperProps) => {
    return (
        <Card className='w-[400px] shadow-md bg-background text-foreground'>
            <CardHeader>
                <AuthHeader label={headerLabel}/>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            {showSocial && (
                <CardFooter>
                    <AuthSocial />
                </CardFooter>
            )} 
            <CardFooter>
                <AuthBackButton label={backButtonLabel} href={backButtonHref}/>
            </CardFooter>
        </Card>
    )
}