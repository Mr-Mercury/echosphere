'use server';

import * as z from 'zod';
import { ChangeStatusMessageSchema } from '@/zod-schemas';
import { db } from '@/lib/db/db';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';

export const changeStatusMessageAction = async (values: z.infer<typeof ChangeStatusMessageSchema>) => {
    const validatedFields = ChangeStatusMessageSchema.safeParse(values);

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return { error: errors.statusMessage?.join(", ") || "Invalid status message." };
    }

    const { statusMessage } = validatedFields.data;
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized. Please log in." };
    }

    // Check if the new status message is the same as the current one
    // Note: statusMessage can be null or empty string, handle comparison carefully
    if (user.statusMessage === (statusMessage || null)) { // Treat empty string from form as null if DB stores it as null
        return { success: "Status message unchanged." }; // Or error, depending on desired UX
    }

    try {
        await db.user.update({
            where: { id: user.id },
            data: { statusMessage: statusMessage || null }, // Ensure null is saved if string is empty
        });
        return { success: "Status message updated successfully!" };
    } catch (error) {
        console.error("Error updating status message:", error);
        return { error: "Failed to update status message. Please try again." };
    }
}; 