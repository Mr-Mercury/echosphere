import * as z from 'zod';
import {passwordValidator} from '@/lib/utils/data/validators/registration-validators'

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {
        message: 'Password is Required'
    })
});

export const RegistrationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, {
        message: 'Password requires at least 8 chars'
    })
});