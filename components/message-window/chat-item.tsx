'use client';

import { Member, MemberRole, User } from "@prisma/client";
import { UserAvatar } from "../islets/users/user-avatar";
import NavTooltip from "../server-listing-sidebar-components/nav-tooltip";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utilities/clsx/utils";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import qs from "query-string";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSocket } from "../providers/socket-provider";
import { useRouter, useParams } from "next/navigation";
import { getRoleIcon } from "@/lib/utilities/role-icons";



interface ChatItemProps {
    id: string;
    content: string;
    member: Member & {
        user: User;
    };
    timestamp: string;
    fileUrl: string | null;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    messageApiUrl: string;
    socketQuery: Record<string, string>;
    type: 'dm' | 'channel';
    modelName?: string;
}

const formSchema = z.object({
    content: z.string().min(1),
});

const ChatItem = ({
    id, content, member, timestamp, fileUrl, deleted,
    currentMember, isUpdated, modelName,
    messageApiUrl, socketQuery, type
}: ChatItemProps) => {
    if (!id || !member || !currentMember) {
        console.error('Missing required props:', { id, member, currentMember });
        return null;
    }

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { socket } = useSocket();

    const fileType = fileUrl?.split('.').pop();
    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner;
    const isPDF = fileType === 'pdf' && fileUrl;
    const isImage = !isPDF && fileUrl;
    const params = useParams();
    const router = useRouter();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    })

    const onMemberClick = () => {
        if (member.id === currentMember.id) {
            return
        }

        router.push(`/chat/server/personal/dm/${member.id}`);

    }

    //Prevents previous message from showing when triggering isEditing (e.g. during live messaging)
    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === 'Escape' || event.keyCode === 27) {
                setIsEditing(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, []);

    useEffect(() => {
        form.reset({
            content: content,
        })
    }, [content])

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (socket) {
                socket.emit('alter', { query: socketQuery, messageId: id, content: values.content, method: 'EDIT', type: type });
                setIsEditing(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const onDelete = async () => {
        try {
            console.log('Delete clicked, socket:', socket);
            setIsDeleting(true);
            if (!socket) {
                console.log('No socket connection!');
                return;
            }

            console.log('Emitting alter event:', { // Debug log
                query: socketQuery,
                messageId: id,
                method: 'DELETE',
                type: type,
            });

            socket.emit('alter', {
                query: socketQuery,
                messageId: id,
                method: 'DELETE',
                content: 'This message has been deleted',
                type: type,
                // or just leave it undefined since the handler sets it
            });

            setIsDeleting(false);
        } catch (error) {
            console.log('DELETE ERROR:', error);
            setIsDeleting(false);
        }
    };

    return (
        <div className='relative group flex items-center hover:bg-black/5 p-4 transition w-full'>
            <div className='group flex gap-x-2 items-start w-full'>
                <div onClick={onMemberClick} className='cursor-pointer hover:drop-shadow-md transition'>
                    <UserAvatar src={member.user.image!} />
                </div>
                <div className='flex flex-col w-full'>
                    <div className='flex items-center gap-x-2'>
                        <div className='flex items-center'>
                            <NavTooltip label={member.role}>
                                {getRoleIcon(member.role, undefined, member.role === 'ECHO' ? modelName : null)}
                            </NavTooltip>
                            <p onClick={onMemberClick} className='font-semibold text-sm hover:underline cursor-pointer ml-1'>
                                {member.user.username}
                            </p>
                        </div>
                        <span className='text-xs text-zinc-400'>
                            {timestamp}
                        </span>
                    </div>
                    {isImage && (
                        <a href={fileUrl} target='_blank' rel='noopener noreferrer'
                            className='relative aspect-square rounded-md mt-2 overflow-hidden border 
                            flex items-center bg-primary h-48 w-48'>
                            <Image src={fileUrl} alt={content} layout='fill' className='object-cover' />
                        </a>
                    )}
                    {isPDF && (
                        <div className='relative flex items-center p-2 mt-2 rounded-md
                        bg-background/10'>
                            <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400' />
                            <a href={fileUrl} target='_blank' rel='noopener noreferrer' className='ml-2 text-sm text-indigo-400 hover:underline'>
                                PDF file
                            </a>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn(
                            'text-sm text-zinc-300',
                            deleted && 'italic text-zinc-400 text-xs mt-1'
                        )}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className='text-[10px] mx-2 text-zinc-400'>
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form className='flex items-center w-full gap-x-2 pt-2'
                                onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name='content'
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormControl>
                                                <div className='relative w-full'>
                                                    <Input disabled={isLoading}
                                                        className='p-2 bg-zinc-700/75 border-none border-0 focus-visible:ring-0
                                                    focus-visible:ring-offset-0 text-zinc-200'
                                                        placeholder='Edited message'
                                                        {...field}
                                                    />
                                                </div>

                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={isLoading} size='sm' variant='primary'>
                                    Save
                                </Button>
                            </form>
                            <span className='text-[10px] mt-1 text-zinc-400'>
                                Press escape to cancel, hit enter to save
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className='hidden group-hover:flex items-center 
                gap-x-2 absolute p-1 -top-2 right-5 bg-zinc-800
                border-gray-800 rounded-sm'>
                    {canEditMessage && (
                        <NavTooltip label='Edit'>
                            <Edit className='cursor-pointer ml-auto w-4 h-4
                            text-zinc-500 hover:text-zinc-300 transition'
                                onClick={() => setIsEditing(true)} />
                        </NavTooltip>
                    )}
                    {canDeleteMessage && (
                        <NavTooltip label='Delete'>
                            <Trash className='cursor-pointer ml-auto w-4 h-4
                            text-zinc-500 hover:text-zinc-300 transition'
                                onClick={() => {
                                    setIsDeleting(true);
                                    onDelete();
                                }} />
                        </NavTooltip>
                    )}

                </div>
            )}
        </div>
    )
}

export default ChatItem;