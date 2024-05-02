'use client'

interface AuthButtonProps {
    children: React.ReactNode;
    mode?: 'model' | 'redirect';
    asChild?: boolean;
}

export const AuthButton = ({
    children, mode='redirect', asChild,
}: AuthButtonProps) => {

    const onClick = () => {
        console.log('click!')
    }

    return (
        <span onClick={onClick} className='cursor-pointer'>
            {children}
        </span>
    )
}
