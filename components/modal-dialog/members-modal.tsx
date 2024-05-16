'use client'

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
import { Check, Loader2, MoreVertical, Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSubContent, 
    DropdownMenuTrigger, DropdownMenuSubTrigger } from "../ui/dropdown-menu";
import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";
import { MemberRole } from "@prisma/client";

const roleIcons = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
    'ADMIN': <ShieldAlert className='h-4 w-4 text-rose-500' />,
}

const MembersModal = () => {
    const { onOpen, isOpen, onClose, type, data } = useModal();
    const [loadingId, setLoadingId] = useState('');

    const isModalOpen = isOpen && type ==='members';
    const { server } = data as { server: ServerWithMembersAndProfiles };

    const onRoleChange = async (userId: string, role: MemberRole) => {
        try {
            setLoadingId(userId);
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
                <ScrollArea className='mt-8 max-h-[420] pr-6'>
                    {server?.members?.map((member) => (
                        <div key={member.id} className='flex items-center gap-x-2 mb-6'>
                            <UserAvatar src={member.user.image}/> 
                            <div className='flex flex-col gap-y-1'>
                                <div className='text-xs gap-x-1 font-semibold flex items-center'>
                                    {roleIcons[member.role]}
                                    {member.user.username}: {member.role}
                                </div>
                                <p className='text-xs px-6 text-zinc-500'>
                                    {member.user.email}
                                </p>
                            </div>
                            {loadingId === member.id && (
                                <Loader2 className='animate-spin text-zinc-500 ml-auto h-4 w-4' />
                            )}   
                            {server.userId !== member.userId && loadingId !== member.id && (
                                <div className='ml-auto'>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className='h-4 w-4 text-zinc-100'/>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='bg-black text-xs font-medium 
                                            text-neutral-400' side='left'>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className='flex items-center'>
                                                    <ShieldQuestion className='w-4 h-4 mr-2' />
                                                    <span>Role</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent className='bg-black text-xs 
                                                    font-medium text-neutral-400'>
                                                        <DropdownMenuItem>
                                                            <Shield className='h-4 w-4 mr-2' />
                                                            Guest
                                                            {member.role === 'GUEST' && 
                                                            <Check className='h-4 w-4 ml-auto'/>}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <ShieldCheck className='h-4 w-4 mr-2' />
                                                            Moderator
                                                            {member.role === 'MODERATOR' && 
                                                            <Check className='h-4 w-4 ml-auto'/>}
                                                        </DropdownMenuItem>
                                                        {/*TODO: Add second member modal for bots, conditional on being a bot*/}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <Trash2 className='h-4 w-4 mr-2 text-rose-500'/>
                                                <div className='text-rose-500'>
                                                    Remove
                                                </div>
                                            </DropdownMenuItem>
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