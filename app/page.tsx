import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/islet/auth/auth-button";
import { cn } from "@/lib/utils";

const Home = () => {
    return (
        <main className='flex h-full h-screen flex-col items-center 
        justify-center bg-[#313338] text-white'>
            <div className='flex flex-col items-center space-y-6'>
                <h1 className='text-6xl font-semibold text-white drop-shadow-md'>
                    Echosphere
                </h1>
                <p className='text-white text-lg'>
                    Login to your Echosphere Account
                </p>
                <div>
                    <AuthButton>
                        <Button variant='secondary' size='lg'>
                            Sign In
                        </Button>
                    </AuthButton>
                </div>
            </div>
        </main>
    )
}

export default Home;