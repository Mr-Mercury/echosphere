'use client'

import qs from 'query-string';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from "../ui/dialog"

import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";
import axios from "axios";
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../islets/users/user-avatar";
import { Check, Loader2, MoreVertical, Bot, ShieldAlert, ShieldCheck, ShieldQuestion, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSubContent, 
    DropdownMenuTrigger, DropdownMenuSubTrigger } from "../ui/dropdown-menu";
import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";
import { Member, MemberRole } from "@prisma/client";
import { useRouter } from 'next/navigation';
import { getRoleIcon } from "@/lib/utilities/role-icons";
import { deleteServerBotAction } from "@/app/actions/delete-server-bot";

const MembersModal = () => {
    const router = useRouter();
    const { onOpen, isOpen, onClose, type, data } = useModal();
    const [loadingId, setLoadingId] = useState('');

    const isModalOpen = isOpen && type ==='members';
    const { server } = data as { server: ServerWithMembersAndProfiles };

    const onDelete = async (member: Member) => {
        try {
            setLoadingId(member.userId);
            
            // Handle bot deletion differently
            if (member.role === 'ECHO') {
                const result = await deleteServerBotAction(member.userId, server.id);
                if (result.error) {
                    throw new Error(result.error);
                }
                router.refresh();
                onOpen('members', { server });
                return;
            }

            // Regular member deletion
            const url = qs.stringifyUrl({
                url: `/api/members/${member.id}`,
                query: {
                    serverId: server.id,
                }
            });
            const res = await axios.delete(url);
            router.refresh();
            onOpen('members', {server: res.data});
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId('');
        }
    }
    const onRoleChange = async (member: Member, role: MemberRole) => {
        try {
            setLoadingId(member.userId);
            const url = qs.stringifyUrl({
                url: `/api/members/${member.id}`,
                query: {
                    serverId: server.id,
                }
            });
            const res = await axios.patch(url, {role});
            router.refresh();
            onOpen('members', {server: res.data});
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId('')
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className='bg-black text-white overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Manage Server Participants
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        { server?.members?.length} Member(s)
                    </DialogDescription>
                </DialogHeader>
                {/* TODO: Fix the icons to leave a blank spot OR have an icon for all roles so names don't bounce on role change */}
                <ScrollArea className='mt-8 max-h-[420px] pr-6'>
                    {server?.members?.map((member) => (
                        <div key={member.id} className='flex items-center gap-x-2 mb-6'>
                            <UserAvatar 
                                src={member.user.image || 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg'} 
                            /> 
                            <div className='flex flex-col gap-y-1'>
                                <div className='text-xs gap-x-1 font-semibold flex items-center'>
                                    {getRoleIcon(member.role)}
                                    {member.user.username}: {member.role}
                                </div>
                                <p className='text-xs px-6 text-zinc-500'>
                                    {member.user.email}
                                </p>
                            </div>
                            {loadingId === member.userId && (
                                <Loader2 className='animate-spin text-zinc-500 ml-auto h-4 w-4' />
                            )}   
                            {server.userId !== member.userId && loadingId !== member.userId && (
                                <div className='ml-auto'>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className='h-4 w-4 text-zinc-100'/>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='bg-black text-xs font-medium 
                                            text-neutral-400' side='left'>
                                            {member.role === 'ECHO' ? (
                                                <DropdownMenuItem onClick={() => onDelete(member)}>
                                                    <Trash2 className='h-4 w-4 mr-2 text-rose-500'/>
                                                    <div className='text-rose-500'>
                                                        Remove Bot
                                                    </div>
                                                </DropdownMenuItem>
                                            ) : (
                                                <>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger className='flex items-center'>
                                                            <ShieldQuestion className='w-4 h-4 mr-2' />
                                                            <span>Role</span>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent className='bg-black text-xs 
                                                            font-medium text-neutral-400'>
                                                                <DropdownMenuItem onClick={() => onRoleChange(member, 'GUEST')}>
                                                                    <Bot className='h-4 w-4 mr-2' />
                                                                    Guest
                                                                    {member.role === 'GUEST' && 
                                                                    <Check className='h-4 w-4 ml-auto'/>}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => onRoleChange(member, 'MODERATOR')}>
                                                                    <ShieldCheck className='h-4 w-4 mr-2' />
                                                                    Moderator
                                                                    {member.role === 'MODERATOR' && 
                                                                    <Check className='h-4 w-4 ml-auto'/>}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onDelete(member)}>
                                                        <Trash2 className='h-4 w-4 mr-2 text-rose-500'/>
                                                        <div className='text-rose-500'>
                                                            Remove
                                                        </div>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default MembersModal;