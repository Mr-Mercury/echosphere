import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/islets/auth/auth-button";
import { cn } from "@/lib/utils";


// NOTE - REMEMBER TO PROGRAMMATICALLY SKIP THIS PAGE AND JUMP TO CHAT OR THE 
// DASHBOARD OR RESPONSE TABLES IF USER HAS A PREVIOUS SESSION

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
                            Sign In or Register Account
                        </Button>
                    </AuthButton>
                </div>
            </div>
        </main>
    )
}

export default Home;