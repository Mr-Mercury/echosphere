const AuthLayout = ({ children }: 
    { 
        children: React.ReactNode
    }) => {
    return (
        <div className='h-full flex items-center justify-center 
        bg-background text-white'>
            {children}
        </div>
    )
}

export default AuthLayout;