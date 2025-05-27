'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChangeUsernameSchema, ChangeRealNameSchema, ChangeStatusMessageSchema } from '@/zod-schemas';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FormError } from "@/components/islets/auth/auth-form-error";
import { FormSuccess } from "@/components/islets/auth/auth-form-success";
import { changeUsernameAction } from "@/app/actions/change-username";
import { changeRealNameAction } from "@/app/actions/change-real-name";
import { changeStatusMessageAction } from '@/app/actions/change-status-message';
import { useState, useTransition, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Label } from "@/components/ui/label";
import NavTooltip from '@/components/server-listing-sidebar-components/nav-tooltip';

interface UserProfileEditFormProps {
    currentUsername: string | null | undefined;
    currentRealName: string | null | undefined;
    currentStatusMessage: string | null | undefined;
}

type FormState = { success?: string; error?: string };

export function UserProfileEditForm({
    currentUsername,
    currentRealName,
    currentStatusMessage,
}: UserProfileEditFormProps) {
    const [isPending, startTransition] = useTransition();
    const [usernameMessage, setUsernameMessage] = useState<FormState>({});
    const [realNameMessage, setRealNameMessage] = useState<FormState>({});
    const [statusMsgState, setStatusMsgState] = useState<FormState>({});

    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingRealName, setIsEditingRealName] = useState(false);

    const usernameForm = useForm<z.infer<typeof ChangeUsernameSchema>>({ resolver: zodResolver(ChangeUsernameSchema), defaultValues: { username: currentUsername || '' } });
    const realNameForm = useForm<z.infer<typeof ChangeRealNameSchema>>({ resolver: zodResolver(ChangeRealNameSchema), defaultValues: { name: currentRealName || '' } });
    const statusForm = useForm<z.infer<typeof ChangeStatusMessageSchema>>({ resolver: zodResolver(ChangeStatusMessageSchema), defaultValues: { statusMessage: currentStatusMessage || '' } });

    useEffect(() => { usernameForm.reset({ username: currentUsername || '' }); }, [currentUsername, usernameForm]);
    useEffect(() => { realNameForm.reset({ name: currentRealName || '' }); }, [currentRealName, realNameForm]);
    useEffect(() => { statusForm.reset({ statusMessage: currentStatusMessage || '' }); }, [currentStatusMessage, statusForm]);

    const handleUsernameSubmit = (values: z.infer<typeof ChangeUsernameSchema>) => {
        setUsernameMessage({});
        startTransition(() => {
            changeUsernameAction(values).then((data) => {
                setUsernameMessage(data);
                if (data.success) {
                    setIsEditingUsername(false);
                    // The ProfileForm component will re-render due to prop changes from the page if username is part of userProfile there.
                    // If direct update is needed here for immediate reflection before full re-render:
                    // usernameForm.reset({ username: values.username }); 
                }
            });
        });
    };

    const handleRealNameSubmit = (values: z.infer<typeof ChangeRealNameSchema>) => {
        setRealNameMessage({});
        startTransition(() => {
            changeRealNameAction(values).then((data) => {
                setRealNameMessage(data);
                if (data.success) {
                    setIsEditingRealName(false);
                    // realNameForm.reset({ name: values.name });
                }
            });
        });
    };

    const fullHandleStatusSubmit = (values: z.infer<typeof ChangeStatusMessageSchema>) => {
        setStatusMsgState({});
        startTransition(() => {
            changeStatusMessageAction(values).then(setStatusMsgState);
        });
    };

    useEffect(() => { let timer: NodeJS.Timeout; if (usernameMessage.success || usernameMessage.error) timer = setTimeout(() => setUsernameMessage({}), 3000); return () => clearTimeout(timer); }, [usernameMessage]);
    useEffect(() => { let timer: NodeJS.Timeout; if (realNameMessage.success || realNameMessage.error) timer = setTimeout(() => setRealNameMessage({}), 3000); return () => clearTimeout(timer); }, [realNameMessage]);
    useEffect(() => { let timer: NodeJS.Timeout; if (statusMsgState.success || statusMsgState.error) timer = setTimeout(() => setStatusMsgState({}), 3000); return () => clearTimeout(timer); }, [statusMsgState]);

    return (
        <div className="space-y-4">
            {/* Username Section */}
            <div className="flex items-center py-2 min-h-[56px]"> {/* min-height to prevent layout shifts */}
                <Label className="text-sm font-medium text-zinc-300 w-32 shrink-0">Username:</Label>
                <div className="flex-grow ml-4">
                    {!isEditingUsername ? (
                        <div className="flex items-center">
                            <p className="text-sm text-zinc-100">{usernameForm.getValues('username') || 'Not set'}</p>
                            <NavTooltip label="Edit Username" side="right" align="center">
                                <Button variant="ghost" size="icon" onClick={() => setIsEditingUsername(true)} className="text-zinc-400 hover:text-zinc-100 h-7 w-7 ml-3"> {/* Added ml-3 */}
                                    <Pencil className="h-3 w-3" />
                                </Button>
                            </NavTooltip>
                        </div>
                    ) : (
                        <Form {...usernameForm}>
                            <form onSubmit={usernameForm.handleSubmit(handleUsernameSubmit)} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FormField
                                        control={usernameForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem className="w-3/4 max-w-sm"> {/* Shortened field */}
                                                <FormControl>
                                                    <Input {...field} disabled={isPending} placeholder="Enter new username" className="bg-zinc-900 border-zinc-700 h-9 text-sm" />
                                                </FormControl>
                                                <FormMessage className="text-xs pt-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="icon" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9 shrink-0">
                                       <Check className="h-4 w-4"/>
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => { setIsEditingUsername(false); usernameForm.reset({ username: currentUsername || '' }); setUsernameMessage({}); }} disabled={isPending} className="text-zinc-400 hover:text-zinc-100 h-9 w-9 shrink-0">
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <FormError message={usernameMessage.error} />
                                <FormSuccess message={usernameMessage.success} />
                            </form>
                        </Form>
                    )}
                </div>
            </div>

            {/* Real Name Section - Inline Style */}
            <div className="flex items-center py-2 min-h-[56px]">  {/* min-height to prevent layout shifts */}
                <Label className="text-sm font-medium text-zinc-300 w-32 shrink-0">Real Name:</Label>
                <div className="flex-grow ml-4">
                    {!isEditingRealName ? (
                        <div className="flex items-center"> 
                            <p className="text-sm text-zinc-100">{realNameForm.getValues('name') || 'Not set'}</p>
                            <NavTooltip label="Edit Real Name" side="right" align="center">
                                <Button variant="ghost" size="icon" onClick={() => setIsEditingRealName(true)} className="text-zinc-400 hover:text-zinc-100 h-7 w-7 ml-3"> {/* Added ml-3 */}
                                    <Pencil className="h-3 w-3" />
                                </Button>
                            </NavTooltip>
                        </div>
                    ) : (
                        <Form {...realNameForm}>
                            <form onSubmit={realNameForm.handleSubmit(handleRealNameSubmit)} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FormField
                                        control={realNameForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="w-3/4 max-w-sm"> 
                                                <FormControl>
                                                    <Input {...field} disabled={isPending} placeholder="Enter new real name" className="bg-zinc-900 border-zinc-700 h-9 text-sm" />
                                                </FormControl>
                                                <FormMessage className="text-xs pt-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="icon" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9 shrink-0">
                                        <Check className="h-4 w-4"/>
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => { setIsEditingRealName(false); realNameForm.reset({ name: currentRealName || '' }); setRealNameMessage({});}} disabled={isPending} className="text-zinc-400 hover:text-zinc-100 h-9 w-9 shrink-0">
                                         <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <FormError message={realNameMessage.error} />
                                <FormSuccess message={realNameMessage.success} />
                            </form>
                        </Form>
                    )}
                </div>
            </div>
            
            {/* Status Message Section */}
            <div className="py-3">
                <Label htmlFor="statusMessageField" className="text-sm font-medium text-zinc-300 mb-2 block">Status Message</Label> {/* Changed htmlFor to avoid conflict if id="statusMessage" is used elsewhere */}
                <Form {...statusForm}>
                    <form onSubmit={statusForm.handleSubmit(fullHandleStatusSubmit)} className="space-y-3">
                        <FormField
                            control={statusForm.control}
                            name="statusMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            id="statusMessageField" // Ensure this id matches Label's htmlFor
                                            disabled={isPending}
                                            placeholder="What's on your mind?"
                                            className="bg-zinc-900 border-zinc-700 min-h-[60px] text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs pt-1" />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-start"> 
                            <Button type="submit" size="sm" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
                                Update Status
                            </Button>
                        </div>
                        <FormError message={statusMsgState.error} />
                        <FormSuccess message={statusMsgState.success} />
                    </form>
                </Form>
            </div>
        </div>
    );
}