'use server';

import { currentUser } from '@/lib/utilities/data/fetching/currentUser';

export const handleChangeEmailAction = async (formData: FormData) => {
    const newEmail = formData.get("newEmail") as string;
    const user = await currentUser();
    
    if (!user) {
        return { error: "Unauthorized" };
    }
    console.log("Attempting to change email to:", newEmail);
    // Add logic to update email and send verification for the new email
};