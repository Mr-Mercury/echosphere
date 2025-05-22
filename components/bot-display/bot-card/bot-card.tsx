'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Bot, Eye } from "lucide-react";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { MODEL_DISPLAY } from "@/lib/config/models";
import ViewBotPromptDialog from '@/components/dialogs/view-bot-prompt-dialog';

export interface ActionButtonConfig {
  text: string;
  onClick: () => void;
  icon?: React.ElementType; // Optional icon component
}

interface BotCardProps {
  id?: string;
  name: string;
  description: string;
  prompt: string;
  copiesCreated: number;
  model: string;
  imageUrl: string;
  createdAt: string;
  actionButtonConfig?: ActionButtonConfig | null; // CUSTOM BUTTON PROP - used for select/deselect bot in create server template modal
}

const BotCard = ({
  id = 'sample-bot-id',
  name = 'Sample Bot',
  description = 'This is a sample bot description that explains what the bot does.',
  prompt = 'Default prompt for the bot to give it instructions on how to behave.',
  copiesCreated = 120,
  model = 'Claude',
  imageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
  createdAt = '2023-04-01',
  actionButtonConfig
}: BotCardProps) => {
  const { onOpen } = useModal();
  // Get model color from the centralized configuration
  const modelConfig = MODEL_DISPLAY[model as keyof typeof MODEL_DISPLAY] || MODEL_DISPLAY.default;
  const modelColor = modelConfig.color;
  const displayName = modelConfig.displayName;

  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);

  const handleCopyButtonClick = () => {
    console.log("Copy button clicked for template:", { id, name, image: imageUrl });
    
    // Pass the template ID to the modal
    onOpen('copyBot', { templateId: id });
  };

  return (
    <>
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
                    {displayName}
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
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-zinc-100">Description:</span>
                <NavTooltip label="View Full Description & Prompt">
                  <button
                    onClick={() => setIsPromptDialogOpen(true)}
                    className={cn(
                      "p-1 text-zinc-400 transition-colors hover:text-indigo-400"
                    )}
                    aria-label="View full description and prompt"
                  >
                    <Eye size={16} />
                  </button>
                </NavTooltip>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-3">{description}</p>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-zinc-100">Prompt:</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">{prompt}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {actionButtonConfig === null ? null : actionButtonConfig ? (
            // Custom button render if prop is provided
            <NavTooltip label={actionButtonConfig.text}>
              <Button
                onClick={actionButtonConfig.onClick}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700"
              >
                {actionButtonConfig.icon && <actionButtonConfig.icon size={14} />}
                {actionButtonConfig.text}
              </Button>
            </NavTooltip>
          ) : (
            // Default button
            <Button
              onClick={handleCopyButtonClick}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2 bg-black border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-50"
            >
              <Copy size={14} />
              Create a copy
            </Button>
          )}
        </CardFooter>
      </Card>
      <ViewBotPromptDialog
        isOpen={isPromptDialogOpen}
        onClose={() => setIsPromptDialogOpen(false)}
        promptText={prompt}
        botName={name}
        descriptionText={description}
        botId={id}
      />
    </>
  );
};

export default BotCard;
