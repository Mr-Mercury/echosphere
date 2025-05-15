'use client'

import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";
import { ChannelType, MemberRole } from "@prisma/client";
import { Plus, Settings, Power, X, Check } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useBotToggleStore } from "@/hooks/use-bot-toggle-store";

interface ServerListingProps {
    label: string;
    role?: MemberRole;
    sectionType: 'channels' | 'members';
    channelType?: ChannelType;
    server?: ServerWithMembersAndProfiles; 
}

export const ServerListing = ({
    label, role, sectionType, channelType, server
}: ServerListingProps) => {

    const { onOpen } = useModal();
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{
        visible: boolean;
        success: boolean;
        message: string;
    }>({
        visible: false,
        success: false,
        message: ""
    });

    // Get the store function to update server bot statuses
    const { 
        updateServerBots, 
        isTogglingAny, 
        setIsTogglingAny 
    } = useBotToggleStore();

    // Hide feedback message after 5 seconds
    useEffect(() => {
        if (feedback.visible) {
            const timer = setTimeout(() => {
                setFeedback(prev => ({ ...prev, visible: false }));
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [feedback.visible]);

    const handleStopAllBots = async () => {
        if (!server) return;
        
        try {
            // Set both local and global loading states
            setIsLoading(true);
            setIsTogglingAny(true);
            
            const response = await axios.post(`/api/bots/server-bots/multi-bot/server-stop-all`, {
                serverId: server.id
            });
            
            const { count, details } = response.data;
            
            // Create a formatted message showing successful and failed bots
            let message = `Stopped ${count} bots.`;
            
            // Update the bot status store to indicate all bots for this server are stopped
            updateServerBots(server.id, false);
            
            setFeedback({
                visible: true,
                success: true,
                message
            });
        } catch (error) {
            console.error("Failed to stop bots:", error);
            setFeedback({
                visible: true,
                success: false,
                message: "Failed to stop bots."
            });
        } finally {
            // Clear both local and global loading states
            setIsLoading(false);
            setIsTogglingAny(false);
        }
    };

    // Determine if button should be disabled
    const isButtonDisabled = isLoading || isTogglingAny;

    return (
        <div className='flex items-center justify-between py-2 pr-3'>
            <div className="flex items-center">
                <p className='text-xs uppercase font-semibold text-zinc-400'>
                    {label}
                </p>
                {feedback.visible && (
                    <div className={`ml-2 text-xs flex items-center ${feedback.success ? 'text-green-500' : 'text-red-500'}`}>
                        {feedback.success ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        {feedback.message}
                    </div>
                )}
            </div>
            {role !== MemberRole.GUEST && sectionType === 'channels' && (
                <NavTooltip label='Create Channel' side='top'>
                    <button 
                        onClick={() => onOpen('createChannel', { channelType })}
                        className='text-zinc-400 hover:text-zinc-300 transition relative z-10 overflow-visible rounded-md p-1'>
                        <Plus className='h-4 w-4'/>
                    </button>
                </NavTooltip>
            )}
            {role !== MemberRole.GUEST && sectionType === 'members' && (
                <div className="flex items-center">
                    <NavTooltip label='Stop All Bots' side='top'>
                        <button 
                            onClick={handleStopAllBots}
                            disabled={isButtonDisabled}
                            className={`text-zinc-400 hover:text-red-500 transition relative z-10 overflow-visible rounded-md p-1 mr-1 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Power className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`}/>
                        </button>
                    </NavTooltip>
                    
                    {role === MemberRole.ADMIN && (
                        <NavTooltip label='Manage Members' side='top'>
                            <button 
                                onClick={() => onOpen('members', { server })}
                                disabled={isButtonDisabled}
                                className={`text-zinc-400 hover:text-zinc-300 transition relative z-10 overflow-visible rounded-md p-1 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Settings className='h-4 w-4'/>
                            </button>
                        </NavTooltip>
                    )}
                </div>
            )}
        </div>
    )
}