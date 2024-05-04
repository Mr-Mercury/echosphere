'use server';
import * as z from 'zod';
import { RegistrationSchema } from '@/schemas';


//Again, type safety for login using zod
export const registerAction = async (values: z.infer<typeof RegistrationSchema>) => {
    const validatedFields = RegistrationSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!"}
    }

    return { success: "Validation email sent!"}
}