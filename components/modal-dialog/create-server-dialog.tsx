'use client'

import { ServerSchema } from "@/schemas"
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "../ui/dialog"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";


const CreateServerDialogue = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect( () => {
        setIsMounted(true);
    }, [])
    
    const form = useForm({
        resolver: zodResolver(ServerSchema),
        defaultValues: {
            name: '',
            imageUrl: '',
        }
    })

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof ServerSchema>) => {
        console.log(val);
    }

    if (!isMounted) return null;
    
    return (
        <Dialog open={true}>
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Create a Server
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <p>Customize your server with a name and image</p> 
                        <p>(Don't worry, you can change it later!)</p>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>
                            <div className='flex items-center justify-center text-center'>
                                IMAGE UPLOAD GOES HERE
                            </div>
                            <FormField control={form.control} name='name' render={({field}) => (
                                <FormItem>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                        Server name
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} className='border-0 
                                        focus-visible:ring-0 text-secondary focus-visible:ring-offset-0'
                                        placeholder='Enter Server Name'
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className='px-6 py-4'>
                            <Button disabled={isLoading} variant='secondary'>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateServerDialogue