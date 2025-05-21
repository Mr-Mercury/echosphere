'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from '@/hooks/use-modal-store';
import BotCard from '@/components/bot-display/bot-card/bot-card';

const BotTemplateDetailModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === 'botTemplateDetail';
    const { bot } = data;

    if (!isModalOpen || !bot) {
        return null;
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 text-white border-zinc-700 p-0 max-w-md">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        {bot.name}
                    </DialogTitle>
                    {bot.description && (
                        <DialogDescription className="text-center text-zinc-400 px-6">
                            {bot.description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="p-6">
                    <BotCard {...bot} />
                </div>
                <DialogFooter className="bg-zinc-800/50 px-6 py-4">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BotTemplateDetailModal; 