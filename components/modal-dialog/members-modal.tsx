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


const MembersModal = () => {
    const { onOpen, isOpen, onClose, type, data } = useModal();

    const isModalOpen = isOpen && type ==='members';
    const { server } = data as { server: ServerWithMembersAndProfiles };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
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
                            <UserAvatar />    
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default MembersModal;