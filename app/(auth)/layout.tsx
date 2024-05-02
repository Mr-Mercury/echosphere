const AuthLayout = ({ children }: 
    { 
        children: React.ReactNode
    }) => {
    return (
        <div className='h-full flex items-center justify-center 
        bg-[#313338] text-white'>
            {children}
        </div>
    )
}

export default AuthLayout;