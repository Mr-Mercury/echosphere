'use client'

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "../../ui/dialog"

import qs from 'query-string';

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../../ui/button";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


const DeleteChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type ==='deleteChannel';
    const { server, channel } = data;

    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })

            await axios.delete(url);

            onClose();
            router.push(`/chat/server/${server?.id}`);
            router.refresh();
        } catch(error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Delete <span className='text-indigo-500'>#{channel?.name}</span>?
                    </DialogTitle>
                    <DialogDescription className='text-center text-bold'>
                        (Are you sure you want to obliterate this channel?!)
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='px-6 py-4'>
                    <div className='flex items-center justify-between w-full'>
                        <Button className='bg-zinc-600'
                            disabled={isLoading}
                            onClick={onClose}
                            variant='ghost'
                            >
                            Have Mercy
                        </Button>
                        <Button className='bg-zinc-600'
                            disabled={isLoading}
                            onClick={onClick}
                            variant='primary'
                            >
                            Obliterate it
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteChannelModal;