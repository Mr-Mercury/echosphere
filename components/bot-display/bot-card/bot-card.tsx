'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Copy, Bot } from "lucide-react";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";

// LLM model colors - replace with your actual model colors
const MODEL_COLORS = {
  'Claude': '#7963d2', // Purple for Claude
  'GPT-4': '#10a37f', // Green for GPT-4
  'Mistral': '#0095ff', // Blue for Mistral
  'Llama': '#ff4500', // Orange for Llama
  'default': '#888888' // Default gray
};

interface BotCardProps {
  id?: string;
  name: string;
  description: string;
  prompt: string;
  rating: number;
  copiesCreated: number;
  model: string;
  imageUrl: string;
  createdAt: string;
  onCreateCopy?: () => void;
}

const BotCard = ({
  id = 'sample-bot-id',
  name = 'Sample Bot',
  description = 'This is a sample bot description that explains what the bot does.',
  prompt = 'Default prompt for the bot to give it instructions on how to behave.',
  rating = 8.5,
  copiesCreated = 120,
  model = 'Claude',
  imageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
  createdAt = '2023-04-01',
  onCreateCopy
}: BotCardProps) => {
  // Calculate whole stars and half stars for rating display
  const wholeStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Get model color for the border
  const modelColor = MODEL_COLORS[model as keyof typeof MODEL_COLORS] || MODEL_COLORS.default;

  return (
    <Card className="w-72 h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="relative w-14 h-14 rounded-full overflow-hidden border-2"
              style={{ borderColor: modelColor }}
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
                  style={{ color: modelColor, borderColor: modelColor }}
                >
                  <Bot className="w-3 h-3 mr-1" style={{ color: modelColor }} />
                  {model}
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
            <span className="text-xs font-medium text-muted-foreground">Copies Created</span>
            <span className="text-xs">{copiesCreated}</span>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Created: {createdAt}</div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium">Prompt:</span>
            <p className="text-xs text-muted-foreground line-clamp-2">{prompt}</p>
          </div>
          <div>
            <span className="text-xs font-medium">Description:</span>
            <p className="text-xs text-muted-foreground line-clamp-3">{description}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <NavTooltip label="Create a copy of this bot">
          <Button
            onClick={onCreateCopy}
            variant="default"
            size="sm"
            className="w-full flex items-center gap-2"
          >
            <Copy size={14} />
            Create a copy
          </Button>
        </NavTooltip>
      </CardFooter>
    </Card>
  );
};

export default BotCard;
