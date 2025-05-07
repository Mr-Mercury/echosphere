'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";

// Category colors for server card
const CATEGORY_COLORS = {
  'Gaming': '#7963d2', // Purple for Gaming
  'Education': '#10a37f', // Green for Education
  'Technology': '#0095ff', // Blue for Technology
  'Art': '#ff4500', // Orange for Art
  'Community': '#f8b400', // Yellow for Community
  'default': '#888888' // Default gray
};

interface ServerCardProps {
  id?: string;
  name: string;
  description: string;
  category: string;
  rating: number;
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
  category = 'Technology',
  rating = 8.5,
  memberCount = 120,
  activeMembers = 42,
  imageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
  createdAt = '2023-04-01',
  onJoinServer
}: ServerCardProps) => {
  // Calculate whole stars and half stars for rating display
  const wholeStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Get category color for the border
  const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default;

  return (
    <Card className="w-72 h-full overflow-hidden flex flex-col">
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
              <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
              <div className="flex items-center">
                <Badge 
                  variant="outline" 
                  className="text-xs" 
                  style={{ color: categoryColor, borderColor: categoryColor }}
                >
                  {category}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={cn(
                    i < wholeStars ? "fill-yellow-400 text-yellow-400" : "text-zinc-300",
                    i === wholeStars && hasHalfStar && "fill-yellow-400 text-yellow-400"
                  )}
                  fillOpacity={i < wholeStars ? 1 : i === wholeStars && hasHalfStar ? 0.5 : 0}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {rating.toFixed(1)}/10
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Members
            </span>
            <span className="text-xs">{memberCount}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Active Now</span>
            <span className="text-xs">{activeMembers}</span>
          </div>
          <div className="text-xs text-muted-foreground mb-3">Created: {createdAt}</div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground line-clamp-5">{description}</p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <NavTooltip label="Join this server">
          <Button
            onClick={onJoinServer}
            variant="default"
            size="sm"
            className="w-full flex items-center gap-2"
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