'use server';
import * as z from 'zod';
import { LoginSchema } from '@/schemas';


//Again, type safety for login using zod
export const loginAction = (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!"}
    }

    return { success: "Validation email sent!"}
}