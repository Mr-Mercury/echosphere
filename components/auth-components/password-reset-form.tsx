"use client";

import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema } from '@/zod-schemas';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/islets/auth/auth-form-error';
import { FormSuccess } from '@/components/islets/auth/auth-form-success';
import { resetPasswordAction } from '@/app/actions/reset-password';
import { useTransition, useState, useEffect } from 'react';
import { LockKeyhole } from 'lucide-react';

export function PasswordResetForm() {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        }
    });

    const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
        setError('');
        setSuccess('');

        startTransition(() => {
            resetPasswordAction(values)
                .then((data) => {
                    if (data?.error) setError(data.error);
                    if (data?.success) {
                        setSuccess(data.success);
                        form.reset(); // Clear form on success
                    }
                });
        });
    }
    
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (success || error) {
            timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [success, error]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'>
                <div className='space-y-4'>
                    <FormField control={form.control} name='currentPassword'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Current Password</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                        disabled={isPending}
                                        placeholder='Enter your current password'
                                        type='password'
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField control={form.control} name='newPassword'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">New Password</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                        disabled={isPending}
                                        placeholder='Enter your new password'
                                        type='password'
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField control={form.control} name='confirmNewPassword'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                        disabled={isPending}
                                        placeholder='Confirm your new password'
                                        type='password'
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                </div>
                <FormError message={error} />
                <FormSuccess message={success} />
                <Button disabled={isPending} type='submit' className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <LockKeyhole className="h-4 w-4 mr-2" />
                    Reset Password
                </Button>
            </form>
        </Form>
    )
} 