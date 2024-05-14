'use client'

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from "../ui/dialog"

import { useModal } from "@/hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";


const InviteServerModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const origin = useOrigin();

    const isModalOpen = isOpen && type ==='invite';
    const { server } = data;

    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

    const copyClick = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1000);
    }
    
    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Bring another human into the server
                    </DialogTitle>
                </DialogHeader>
                <div className='p-6'>
                    <Label className='uppercase text-xs font-bold text-secondary'>
                        Invite Link:
                    </Label>
                    <div className='flex items-center mt-2 gap-x-2'>
                        <Input 
                        className='bg-zinc-700/50 border-0 focus-visible:ring-0 
                        text-secondary focus-visible:ring-offset-0'
                        value={inviteUrl}
                        />
                        <Button size='icon'>
                            {copied? <Check />: <Copy onClick={copyClick} className='w-4 h-4'/>}
                        </Button>
                    </div>
                    <Button variant='link' size='sm'
                    className='text-xs text-secondary mt-4'>
                        Generate a new link
                        <RefreshCw className='w-4 h-4 ml-1'/>
                        {/* TODO: REFRESHCW Above ^ Add left spacing*/}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InviteServerModal;