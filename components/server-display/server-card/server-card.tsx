'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Copy } from "lucide-react";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { CATEGORY_COLORS } from "@/lib/config/categories";

interface ServerCardProps {
  id?: string;
  name: string;
  description: string;
  category: keyof typeof CATEGORY_COLORS;
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
  category = 'Movies',
  memberCount = 120,
  activeMembers = 42,
  imageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
  createdAt = '2023-04-01',
  onJoinServer
}: ServerCardProps) => {
  // Get category color for the border
  const categoryColor = CATEGORY_COLORS[category] || '#888888';

  return (
    <Card className="w-72 h-full overflow-hidden flex flex-col bg-black border-2 border-zinc-600 shadow-lg shadow-zinc-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="relative w-14 h-14 rounded-full overflow-hidden border-2"
              style={{ borderColor: categoryColor }}
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
                  style={{ color: categoryColor, borderColor: categoryColor }}
                >
                  <Users className="w-3 h-3 mr-1" style={{ color: categoryColor }} />
                  {category}
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
              <Copy className="h-3 w-3" /> Times Copied
            </span>
            <span className="text-xs text-zinc-100">{memberCount}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-zinc-400">Number of Echoes</span>
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