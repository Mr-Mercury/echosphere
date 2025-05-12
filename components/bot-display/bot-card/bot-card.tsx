'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Bot } from "lucide-react";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { PROVIDER_COLORS } from "@/lib/config/models";

// Map display model names to provider colors
const MODEL_COLORS = {
  'Claude': PROVIDER_COLORS.anthropic.primary,
  'GPT-4': PROVIDER_COLORS.openai.primary,
  'Mistral': '#0095ff', // Blue for Mistral - not in provider colors yet
  'Llama': '#ff4500', // Orange for Llama - not in provider colors yet
  'Gemini': PROVIDER_COLORS.google.primary,
  'default': PROVIDER_COLORS.default
};

interface BotCardProps {
  id?: string;
  name: string;
  description: string;
  prompt: string;
  copiesCreated: number;
  model: string;
  imageUrl: string;
  createdAt: string;
}

const BotCard = ({
  id = 'sample-bot-id',
  name = 'Sample Bot',
  description = 'This is a sample bot description that explains what the bot does.',
  prompt = 'Default prompt for the bot to give it instructions on how to behave.',
  copiesCreated = 120,
  model = 'Claude',
  imageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
  createdAt = '2023-04-01'
}: BotCardProps) => {
  const { onOpen } = useModal();
  // Get model color for the border
  const modelColor = MODEL_COLORS[model as keyof typeof MODEL_COLORS] || MODEL_COLORS.default;

  return (
    <Card className="w-72 h-full overflow-hidden flex flex-col bg-black border-2 border-zinc-600 shadow-lg shadow-zinc-900/20">
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
              <h3 className="font-semibold text-lg line-clamp-1 text-zinc-100">{name}</h3>
              <div className="flex items-center">
                <Badge 
                  variant="outline" 
                  className="text-xs bg-black border-zinc-800" 
                  style={{ color: modelColor, borderColor: modelColor }}
                >
                  <Bot className="w-3 h-3 mr-1" style={{ color: modelColor }} />
                  {model}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-zinc-400">Copies Created</span>
            <span className="text-xs text-zinc-100">{copiesCreated}</span>
          </div>
          <div className="text-xs text-zinc-400 mb-1">Created: {createdAt}</div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-zinc-100">Description:</span>
            <p className="text-xs text-zinc-400 line-clamp-3">{description}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-100">Prompt:</span>
            <p className="text-xs text-zinc-400 line-clamp-2">{prompt}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <NavTooltip label="Create a copy of this bot">
          <Button
            onClick={() => onOpen('copyBot')}
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-black border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-50"
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
