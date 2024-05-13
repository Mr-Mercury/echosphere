'use server';
import * as z from 'zod';
import { LoginSchema } from '@/schemas';
import { signIn } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { generateVerificationToken } from '@/lib/utilities/data/tokens/token-generation';
import { getUserByEmail } from '@/lib/utilities/data/fetching/userData';


//Again, type safety for login using zod
export const loginAction = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!"}
    }

    const { email, password } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: 'Invalid Credentials!' }
    }
    // TODO: Fix verification email
    // if (!existingUser.emailVerified) {
    //     const verificationToken = await generateVerificationToken(existingUser.email);
    //     return { success: 'Confirmation email sent!'};
    // }
    
    try {
        await signIn('credentials', {
            email, password, redirectTo: DEFAULT_LOGIN_REDIRECT
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin': 
                    return { error: 'Email or password was incorrect!'}
                default:
                    return { error: 'Something broke :('}
            }
        }
        throw error;
    }
}