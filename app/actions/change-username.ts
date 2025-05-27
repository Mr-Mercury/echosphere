'use server';

import * as z from 'zod';
import { ChangeUsernameSchema } from '@/zod-schemas';
import { db } from '@/lib/db/db';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { getUserByUsername } from '@/lib/utilities/data/fetching/userData';

export const changeUsernameAction = async (values: z.infer<typeof ChangeUsernameSchema>) => {
    const validatedFields = ChangeUsernameSchema.safeParse(values);

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return { error: errors.username?.join(", ") || "Invalid username." };
    }

    const { username } = validatedFields.data;
    const user = await currentUser();

    if (!user || !user.id) {
        return { error: "Unauthorized. Please log in." };
    }

    if (user.username === username) {
        return { error: "This is already your username." };
    }

    // Check if the new username is already taken by another user
    const existingUserByNewUsername = await getUserByUsername(username);
    if (existingUserByNewUsername && existingUserByNewUsername.id !== user.id) {
        return { error: "Username already taken. Please choose a different one." };
    }

    try {
        await db.user.update({
            where: { id: user.id },
            data: { username },
        });
        return { success: "Username updated successfully!" };
    } catch (error) {
        console.error("Error updating username:", error);
        return { error: "Failed to update username. Please try again." };
    }
};
