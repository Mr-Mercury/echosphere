'use client'

import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";
import { ChannelType, MemberRole } from "@prisma/client";
import { Plus, Settings, Power, X, Check, Play } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useBotToggleStore } from "@/hooks/use-bot-toggle-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utilities/clsx/utils";

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

    // Bot toggle store
    const { 
        updateServerBots, 
        isTogglingAny, 
        setIsTogglingAny,
        serverBotUpdateTimestamp,
        setBotStatus
    } = useBotToggleStore();

    // Check if any bots are active for this server by looking at the database state
    const hasActiveBotsInServer = server?.members.some(member => 
        member.role === 'ECHO' && member.user.botConfig?.isActive
    );

    // Check the local store state which is updated in real-time (from page switches, etc.)
    const botStatuses = useBotToggleStore((state) => state.botStatuses);
    
    const hasActiveBotsInStore = (() => {
        if (!server) return false;
        
        // Check if any bot in this server is marked as active in the store, prioritize store state
        return server.members.some(member => {
            if (member.role !== 'ECHO' || !member.user.botConfig?.id) return false;
            
            // If the bot has a store status, use that; otherwise, fall back to the database state
            const botStatus = botStatuses[member.user.botConfig.id];
            return botStatus === true;
        });
    })();
    
    // Use store status if available, otherwise use server data
    const hasActiveBots = hasActiveBotsInStore || hasActiveBotsInServer;

    // On mount, initialize bot statuses from server data
    useEffect(() => {
        if (server) {
            server.members.forEach(member => {
                if (member.role === 'ECHO' && member.user.botConfig?.id) {
                    setBotStatus(member.user.botConfig.id, member.user.botConfig.isActive);
                }
            });
        }
    }, [server, setBotStatus]);

    // Feedback message: 5 second visibility
    useEffect(() => {
        if (feedback.visible) {
            const timer = setTimeout(() => {
                setFeedback(prev => ({ ...prev, visible: false }));
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [feedback.visible]);

    const handleStartAllBots = async () => {
        if (!server) return;
        
        try {
            setIsLoading(true);
            setIsTogglingAny(true);
            
            const response = await axios.post(`/api/bots/server-bots/multi-bot/server-start-all`, {
                serverId: server.id
            });
            
            const { count, details } = response.data;
            
            let message = `Started ${count} bots.`;
            
            // Update server to indicate a start operation
            updateServerBots(server.id, true);
            
            // Processing API response
            if (details && (details.successful || details.failed)) {
                // Create a mapping of bot names to their configs for quick lookup
                const botNameToConfig: Record<string, any> = {};
                server.members.forEach(member => {
                    if (member.role === 'ECHO' && member.user.botConfig) {
                        botNameToConfig[member.user.botConfig.botName] = member.user.botConfig;
                    }
                });
                
                // Mark successful bots as active
                details.successful?.forEach((botName: string) => {
                    const botConfig = botNameToConfig[botName];
                    if (botConfig && botConfig.id) {
                        console.log(`Setting bot ${botName} (${botConfig.id}) to active`);
                        setBotStatus(botConfig.id, true);
                    }
                });
                
                // Failed bots stay marked as inactive
                details.failed?.forEach((failedBot: { name: string }) => {
                    const botConfig = botNameToConfig[failedBot.name];
                    if (botConfig && botConfig.id) {
                        console.log(`Setting failed bot ${failedBot.name} (${botConfig.id}) to inactive`);
                        setBotStatus(botConfig.id, false);
                    }
                });
            }
            
            setFeedback({
                visible: true,
                success: true,
                message
            });
        } catch (error) {
            console.error("Failed to start bots:", error);
            setFeedback({
                visible: true,
                success: false,
                message: "Failed to start bots."
            });
        } finally {
            setIsLoading(false);
            setIsTogglingAny(false);
        }
    };

    const handleStopAllBots = async () => {
        if (!server) return;
        
        try {
            setIsLoading(true);
            setIsTogglingAny(true);
            
            const response = await axios.post(`/api/bots/server-bots/multi-bot/server-stop-all`, {
                serverId: server.id
            });
            
            const { count, details } = response.data;
            
            let message = `Stopped ${count} bots.`;
            
            // Update to indicate a stop operation has occurred
            updateServerBots(server.id, false);
            
            // Process the successful and failed lists from API response
            if (details && (details.successful || details.failed)) {
                // Create a mapping of bot names to their configs for quick lookup
                const botNameToConfig: Record<string, any> = {};
                server.members.forEach(member => {
                    if (member.role === 'ECHO' && member.user.botConfig) {
                        botNameToConfig[member.user.botConfig.botName] = member.user.botConfig;
                    }
                });
                
                // Mark successful bots as inactive
                details.successful?.forEach((botName: string) => {
                    const botConfig = botNameToConfig[botName];
                    if (botConfig && botConfig.id) {
                        console.log(`Setting bot ${botName} (${botConfig.id}) to inactive`);
                        setBotStatus(botConfig.id, false);
                    }
                });
                
                // Any bots that failed to stop should remain marked as active
                details.failed?.forEach((failedBot: { name: string }) => {
                    const botConfig = botNameToConfig[failedBot.name];
                    if (botConfig && botConfig.id) {
                        console.log(`Failed to stop bot ${failedBot.name} (${botConfig.id}), keeping active`);
                        setBotStatus(botConfig.id, true);
                    }
                });
            }
            
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
            setIsLoading(false);
            setIsTogglingAny(false);
        }
    };

    // Disable button if loading or toggling
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button 
                                disabled={isButtonDisabled}
                                className={cn(
                                    "text-zinc-400 transition relative z-10 overflow-visible rounded-md p-1 mr-1",
                                    isButtonDisabled ? 'opacity-50 cursor-not-allowed' : '',
                                    !isButtonDisabled && hasActiveBots ? 'hover:text-red-500' : 'hover:text-green-500'
                                )}>
                                <Power className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`}/>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-black text-xs font-medium text-neutral-400 space-y-[2px]">
                            <DropdownMenuItem
                                onClick={handleStartAllBots}
                                disabled={isButtonDisabled}
                                className="px-3 py-2 text-sm cursor-pointer"
                            >
                                Start All Bots
                                <Play className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleStopAllBots}
                                disabled={isButtonDisabled}
                                className="px-3 py-2 text-sm cursor-pointer"
                            >
                                Stop All Bots
                                <Power className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={true}
                                className="px-3 py-2 text-sm cursor-not-allowed opacity-50"
                            >
                                Toggle Multiple Bots
                                <Settings className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
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