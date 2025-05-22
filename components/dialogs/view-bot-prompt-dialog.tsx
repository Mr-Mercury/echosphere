'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy } from 'lucide-react';
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";

interface ViewBotPromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    promptText: string;
    botName?: string; // Optional: to display in the title
}

const ViewBotPromptDialog: React.FC<ViewBotPromptDialogProps> = ({
    isOpen,
    onClose,
    promptText,
    botName
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 text-white border-zinc-700 sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        Full Prompt {botName ? `for "${botName}"` : ""}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        The complete prompt that instructs the bot.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] my-4 p-3 bg-zinc-800 rounded-md border border-zinc-700">
                    <pre className="text-sm text-zinc-200 whitespace-pre-wrap break-words">
                        {promptText}
                    </pre>
                </ScrollArea>
                <DialogFooter className="sm:justify-right">
                    <Button variant="secondary" onClick={onClose} size="sm">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewBotPromptDialog; 