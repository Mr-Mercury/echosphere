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

    const onClick = () => {
        console.log('click!')
    }

    if (mode === 'modal') {
        return (
            <span>
                MODAL WAS USED PLZ IMPLEMENT
            </span>
        )
    }

    return (
        <span onClick={onClick} className='cursor-pointer'>
            {children}
        </span>
    )
}
