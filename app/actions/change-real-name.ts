'use server';

import * as z from 'zod';
import { ChangeRealNameSchema } from '@/zod-schemas';
import { db } from '@/lib/db/db';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';

export const changeRealNameAction = async (values: z.infer<typeof ChangeRealNameSchema>) => {
    const validatedFields = ChangeRealNameSchema.safeParse(values);

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return { error: errors.name?.join(", ") || "Invalid name." };
    }

    const { name } = validatedFields.data;
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized. Please log in." };
    }
    
    // Check if the new name is the same as the current one
    if (user.name === name) {
        return { error: "This is already your name." };
    }

    try {
        await db.user.update({
            where: { id: user.id },
            data: { name }, 
        });
        return { success: "Name updated successfully!" };
    } catch (error) {
        console.error("Error updating name:", error);
        return { error: "Failed to update name. Please try again." };
    }
};
