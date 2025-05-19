'use client'

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useModal } from "@/hooks/use-modal-store";
import { deleteServerBotAction } from "@/app/actions/delete-server-bot";
import { useRouter } from "next/navigation";
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";

const DeleteBotConfirmationModal = () => {
    const router = useRouter();
    const { onOpen, isOpen, onClose, type, data } = useModal();
    const [isLoading, setIsLoading] = useState(false);

    const isModalOpen = isOpen && type === 'deleteBot';
    const { server, member } = data as { 
        server: ServerWithMembersAndProfiles;
        member: any;
    };

    const onClick = async () => {
        try {
            setIsLoading(true);
            const result = await deleteServerBotAction(member.userId, server.id);
            if (result.error) {
                throw new Error(result.error);
            }
            if (result.server) {
                onOpen('members', { server: result.server });
            }
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold'>
                        Delete Bot <span className='text-indigo-500'>{member?.user?.username}</span>?
                    </DialogTitle>
                    <DialogDescription className='text-center text-bold'>
                        (Are you sure you want to remove this bot from the server?)
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='px-6 py-4'>
                    <div className='flex items-center justify-between w-full'>
                        <Button 
                            className='bg-zinc-600'
                            disabled={isLoading}
                            onClick={onClose}
                            variant='ghost'
                        >
                            Cancel
                        </Button>
                        <Button 
                            className='bg-zinc-600'
                            disabled={isLoading}
                            onClick={onClick}
                            variant='primary'
                        >
                            Delete Bot
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteBotConfirmationModal; 