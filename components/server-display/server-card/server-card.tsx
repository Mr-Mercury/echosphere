'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Copy, MessageSquareText, Bot as BotIcon, Hash, Volume2 } from "lucide-react";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { CATEGORY_COLORS } from "@/lib/config/categories";
import { ChannelPreview, BotPreview } from '@/lib/entities/server-display-types';

interface ServerCardProps {
  id?: string;
  name: string;
  description: string;
  category: string;
  rating?: number;
  imageUrl: string;
  createdAt: string;
  onJoinServer?: () => void;

  // Fields from ServerTemplate
  usageCount?: number;
  creator?: {
    name: string | null;
    username?: string | null;
    // image: string | null; // Image for creator can be added later
  };
  tags?: string[];
  channelsPreview?: ChannelPreview[];
  botTemplatesPreview?: BotPreview[];
}

const ServerCard = ({
  id = 'sample-server-id',
  name = 'Sample Server',
  description = 'This is a sample server description that explains what the server is about.',
  category = 'Movies',
  rating = 0,
  imageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
  createdAt = '2023-04-01',
  onJoinServer,
  usageCount = 0,
  creator,
  tags = [],
  channelsPreview = [],
  botTemplatesPreview = [],
}: ServerCardProps) => {
  const categoryKey = category as keyof typeof CATEGORY_COLORS;
  const categoryColor = CATEGORY_COLORS[categoryKey] || '#888888';

  const displayBots = botTemplatesPreview.slice(0, 3);
  const remainingBotsCount = botTemplatesPreview.length - displayBots.length;

  // Ensure "general" channel is always present for display if not already in channelsPreview
  const hasGeneralChannel = channelsPreview.some(ch => ch.name.toLowerCase() === 'general');
  const effectiveChannelsPreview = hasGeneralChannel 
    ? channelsPreview 
    : [{ name: 'general', type: 'TEXT' as const }, ...channelsPreview];
  
  const displayChannels = effectiveChannelsPreview.slice(0, 3);
  const remainingChannelsCount = effectiveChannelsPreview.length - displayChannels.length;

  return (
    <Card className="w-72 h-[480px] overflow-hidden flex flex-col bg-black border-2 border-zinc-600 shadow-lg shadow-zinc-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="relative w-14 h-14 rounded-full overflow-hidden border-2 shrink-0"
              style={{ borderColor: categoryColor }}
            >
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <NavTooltip label={name}>
                <h3 className="font-semibold text-lg line-clamp-1 text-zinc-100 cursor-default">{name}</h3>
              </NavTooltip>
              <Badge 
                variant="outline" 
                className="text-xs bg-black border-zinc-800 w-fit"
                style={{ color: categoryColor, borderColor: categoryColor }}
              >
                <Users className="w-3 h-3 mr-1" style={{ color: categoryColor }} />
                {category}
              </Badge>
            </div>
          </div>
        </div>
        {creator && creator.username && (
          <div className="text-xs text-zinc-400 mt-1">Created By: {creator.username}</div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col justify-between text-sm py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50 pr-1">
        <div>
          <p className="text-xs text-zinc-400 line-clamp-2 mb-2 h-[30px]">{description}</p>
          
          <div className="space-y-1.5 text-xs mb-2">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Copy className="h-3 w-3" /> Times Copied:
              </span>
              <span className="text-zinc-100 font-medium mr-1">{usageCount}</span>
            </div>
            
            <div>
              <span className="text-zinc-400 flex items-center gap-1 mb-0.5">
                <BotIcon className="h-3 w-3" /> Echoes Included: ({botTemplatesPreview.length})
              </span>
              <div className="flex items-center gap-1.5 pl-1">
                {displayBots.map(bot => (
                  <NavTooltip key={bot.id} label={bot.name}>
                    <img 
                      src={bot.imageUrl || 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg'} 
                      alt={bot.name} 
                      className="w-5 h-5 rounded-full object-cover border border-zinc-600"
                    />
                  </NavTooltip>
                ))}
                {remainingBotsCount > 0 && (
                  <span className="text-xs text-zinc-500">+{remainingBotsCount} more</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 flex items-center gap-1 mb-0.5">
                <MessageSquareText className="h-3 w-3" /> Channels: ({effectiveChannelsPreview.length})
              </span>
              <div className="pl-1 space-y-0.5">
                {displayChannels.map((channel, index) => (
                  <div key={index} className="flex items-center gap-1 text-zinc-300">
                    {channel.type === 'TEXT' ? <Hash size={10} /> : <Volume2 size={10} />}
                    <span className="truncate text-xs">{channel.name}</span>
                  </div>
                ))}
                {remainingChannelsCount > 0 && (
                  <div className="text-xs text-zinc-500">+{remainingChannelsCount} more</div>
                )}
              </div>
            </div>

          </div>
          {tags && tags.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-zinc-100 mr-1">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-zinc-700 text-zinc-200 hover:bg-zinc-600">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                   <Badge variant="secondary" className="text-xs bg-zinc-700 text-zinc-200">+{tags.length - 3}</Badge>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-zinc-500 mt-auto pt-2">Created: {new Date(createdAt).toLocaleDateString()}</div>
      </CardContent>

      <CardFooter className="pt-2 pb-3">
        <NavTooltip label={`Create a server with this template`}> 
          <Button
            onClick={onJoinServer} 
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-black border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-50"
          >
            <Copy size={14} /> 
            Use Template 
          </Button>
        </NavTooltip>
      </CardFooter>
    </Card>
  );
};

export default ServerCard; 