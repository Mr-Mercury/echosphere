'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { PROVIDER_COLORS } from "@/lib/config/models";

interface ServerCardProps {
  id?: string;
  name: string;
  description: string;
  provider: keyof typeof PROVIDER_COLORS;
  memberCount: number;
  activeMembers: number;
  imageUrl: string;
  createdAt: string;
  onJoinServer?: () => void;
}

const ServerCard = ({
  id = 'sample-server-id',
  name = 'Sample Server',
  description = 'This is a sample server description that explains what the server is about.',
  provider = 'openai',
  memberCount = 120,
  activeMembers = 42,
  imageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
  createdAt = '2023-04-01',
  onJoinServer
}: ServerCardProps) => {
  // Get provider color for the border
  const providerColor = PROVIDER_COLORS[provider]?.primary || PROVIDER_COLORS.default;

  return (
    <Card className="w-72 h-full overflow-hidden flex flex-col bg-black border-2 border-zinc-600 shadow-lg shadow-zinc-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="relative w-14 h-14 rounded-full overflow-hidden border-2"
              style={{ borderColor: providerColor }}
            >
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg line-clamp-1 text-zinc-100">{name}</h3>
              <div className="flex items-center">
                <Badge 
                  variant="outline" 
                  className="text-xs bg-black border-zinc-800" 
                  style={{ color: providerColor, borderColor: providerColor }}
                >
                  {provider}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
              <Users className="h-3 w-3" /> Members
            </span>
            <span className="text-xs text-zinc-100">{memberCount}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-zinc-400">Active Now</span>
            <span className="text-xs text-zinc-100">{activeMembers}</span>
          </div>
          <div className="text-xs text-zinc-400 mb-3">Created: {createdAt}</div>
        </div>
        <div>
          <p className="text-xs text-zinc-400 line-clamp-5">{description}</p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <NavTooltip label="Join this server">
          <Button
            onClick={onJoinServer}
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-black border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-50"
          >
            <UserPlus size={14} />
            Join Server
          </Button>
        </NavTooltip>
      </CardFooter>
    </Card>
  );
};

export default ServerCard; 