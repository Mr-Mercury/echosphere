'use server';
import * as z from 'zod';
import { RegistrationSchema } from '@/schemas';
import bcrypt from "bcryptjs";
import { db } from '@/lib/db/db';
import { getUserByEmail } from '@/lib/utilities/data/fetching/userData';
import { generateVerificationToken } from '@/lib/utilities/data/tokens/token-generation';
import { sendVerificationEmail } from '@/lib/utilities/mail/mail';

//Again, type safety for login using zod
export const registerAction = async (values: z.infer<typeof RegistrationSchema>) => {
    const validatedFields = RegistrationSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!"}
    }

    const { email, password, username } = validatedFields.data;
    const hashedPw = await bcrypt.hash(password, 11);
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return { error: 'If email is in use, you will receive a reset password link'}
    }
    // MAKE SURE IT'S HASHEDPW PASSED TO THE NEW ACCOUNT!!!!!  DO NOT CHANGE THIS!
    await db.user.create({
        data: {
            username,
            email,
            password: hashedPw
        }
    });

    /* TODO: Fix verification tokens */ 
    // const verificationToken = await generateVerificationToken(email);
    // await sendVerificationEmail(verificationToken.email, verificationToken.token)
    return { success: "Verification email sent!"}
}