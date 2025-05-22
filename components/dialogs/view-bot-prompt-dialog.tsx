'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle } from 'lucide-react';
import { useModal } from '@/hooks/use-modal-store';

interface ViewBotPromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    promptText: string;
    botName?: string; // displays in title
    descriptionText?: string;
    botId?: string; // botId prop for "Create a Copy"
}

const ViewBotPromptDialog: React.FC<ViewBotPromptDialogProps> = ({
    isOpen,
    onClose,
    promptText,
    botName,
    descriptionText,
    botId
}) => {
    const { onOpen } = useModal();

    if (!isOpen) {
        return null;
    }

    const handleCreateCopy = () => {
        onClose();
        if (botId) {
            onOpen('copyBot', { templateId: botId });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 text-white border-zinc-700 sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        Details {botName ? `for "${botName}"` : ""}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Review the bot's description and system prompt.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 my-4">
                    {descriptionText && (
                        <div>
                            <h3 className="font-semibold text-zinc-100 mb-1 text-lg">Description:</h3>
                            <ScrollArea className="max-h-[25vh] p-3 bg-zinc-800 rounded-md border border-zinc-700">
                                <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
                                    {descriptionText}
                                </p>
                            </ScrollArea>
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-zinc-100 mb-1 text-lg">Prompt:</h3>
                        <ScrollArea className="max-h-[25vh] p-3 bg-zinc-800 rounded-md border border-zinc-700">
                            <pre className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
                                {promptText}
                            </pre>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="w-full sm:flex items-center">
                    {botId && (
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleCreateCopy}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create a Copy
                        </Button>
                    )}
                    {/* Spacer div, pushes buttons apart.  Idk why tailwind isn't working here, must be parent css lol */}
                    <div className="flex-grow"></div>
                    <Button variant="secondary" onClick={onClose} size="sm">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewBotPromptDialog; 