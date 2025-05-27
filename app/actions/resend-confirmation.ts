'use server'
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';


// TODO: create real implementation
export const handleResendConfirmationAction = async () => {
    const user = await currentUser();
    if (!user) {
        return { error: "Unauthorized" };
    }
    console.log("Resending confirmation email to:", user.email);
};