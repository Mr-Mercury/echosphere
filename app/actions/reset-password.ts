'use server';
import * as z from 'zod';
import { ResetPasswordSchema } from '@/zod-schemas';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/db';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';

export const resetPasswordAction = async (values: z.infer<typeof ResetPasswordSchema>) => {
    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        const errorMessages = Object.values(errors).flat().join(", ");
        return { error: errorMessages || "Invalid fields!" };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    const user = await currentUser();

    if (!user || !user.email || !user.password) {
        return { error: "User not found or not logged in." };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordsMatch) {
        return { error: "Current password does not match." };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 11);

    await db.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
    });

    return { success: "Password updated successfully!" };
}; 