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
import { ShieldAlert, ShieldCheck } from "lucide-react";

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
                            {server.userId !== member.userId && loadingId !== member.id && (
                                <div>
                                    HEY HEY
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