'use server';
import * as z from 'zod';
import { LoginSchema } from '@/zod-schemas';


//Again, type safety for login using zod
export const loginAction = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!"}
    }

    return { success: "Logging in!"}
}