'use client'

import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/schemas';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from '../ui/button';
import { FormError } from '../islets/auth/auth-form-error';
import { FormSuccess } from '../islets/auth/auth-form-success';

export const LoginForm = ({}) => {

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    }); 

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        console.log(values);    
    }
    // I spent like 15 minutes trying to figure out why handleSubmit didn't work
    // for future reference, with useForm, that handleSubmit needs to be passed a 
    // FUNCTION DEFINITION, it will automatically pass it the event.  Nice. 
    return (
        <Form {...form}>
            <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'>
                <div className='space-y-4'>
                    <FormField control={form.control} name='email' 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field}
                                placeholder='mail@mailtown.com'
                                type='email'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem> 
                    )}/>
                    <FormField control={form.control} name='password' 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input {...field}
                                placeholder='********'
                                type='password'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem> 
                    )}/>
                </div>
                <FormError message='placeholder'/>
                <FormSuccess message='placeholder' />
                <Button type='submit' className='w-full' variant='outline'>
                    Login
                </Button>
            </form>
        </Form>
    )
}
