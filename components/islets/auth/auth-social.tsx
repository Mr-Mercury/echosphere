'use client'
import { FaGoogle, FaGithub } from "react-icons/fa";
import { signIn } from 'next-auth/react'
import { Button } from "../../ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";


export const AuthSocial = () => {
    const onClick = (provider: 'google' | 'github') => {
        signIn(provider, {
            callbackUrl: DEFAULT_LOGIN_REDIRECT,
        })
    }
    return (
        <div className='flex items-center w-full gap-x-2'>
            <Button size='lg' className='w-full' variant='outline' 
            onClick={() => onClick('google')}>
                <FaGoogle className='h-5 w-5 text-foreground' />
            </Button>
            <Button size='lg' className='w-full' variant='outline' 
            onClick={() => onClick('github')}>
                <FaGithub className='h-5 w-5 text-foreground' />
            </Button>
        </div>
    )
}