'use client'

import Link from "next/link";

interface AuthButtonProps {
    children: React.ReactNode;
    mode?: 'modal' | 'redirect';
    asChild?: boolean;
}

export const AuthButton = ({
    children, mode='redirect', asChild,
}: AuthButtonProps) => {

    if (mode === 'modal') {
        return (
            <span>
                MODAL WAS USED PLZ IMPLEMENT
            </span>
        )
    }

    return (
        <Link href='/login' className='cursor-pointer'>
            {children}
        </Link>
    )
}
