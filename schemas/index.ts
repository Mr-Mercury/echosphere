import * as z from 'zod';

// Validators

const passwordValidator = (password:string) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasLowerCase && hasUpperCase && hasNumber && hasSymbol;
  };

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
    .refine(passwordValidator, {
        message: 'Password requires both lower and uppercase letters, at least one number, and a symbol'
    }),
    username: z.string().min(1, {
        message: 'You must enter a username'
    })
});

export const ServerSchema = z.object({
    name: z.string().min(1, {
        message: 'You need to name your server'
    }),
    imageUrl: z.string().min(1, {
        message: 'You need an image for your server'
    })
});

export const ChannelSchema = z.object({
    name: z.string().min(1, {
        message: 'You need to name your channel'
    }),
})