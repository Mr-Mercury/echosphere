'use client'

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "../ui/dialog"

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";


const LeaveServerModal = () => {
    const { isOpen, onClose, type, data } = useModal();

    const isModalOpen = isOpen && type ==='leaveServer';
    const { server } = data;

    const [isLoading, setIsLoading] = useState(false);

    // CURRENT SPOT WORKING ON LEAVE SERVER

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Leave <span className='text-indigo-500'>{server?.name}</span>?
                    </DialogTitle>
                    <DialogDescription className='text-center text-bold'>
                        (I'm sure the bots will miss you!)
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='px-6 py-4'>
                    <div className='flex items-center justify-between w-full'>
                        <Button className='bg-zinc-600'
                            disabled={isLoading}
                            onClick={onClose}
                            variant='ghost'
                            >
                            Cancel
                        </Button>
                        <Button className='bg-zinc-600'
                            disabled={isLoading}
                            onClick={() => {}}
                            variant='primary'
                            >
                            Escape
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default LeaveServerModal;