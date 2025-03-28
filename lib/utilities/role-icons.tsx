import { Bot, ShieldAlert, ShieldCheck } from "lucide-react";
import { MemberRole } from "@prisma/client";
import { cn } from "@/lib/utilities/clsx/utils";
import { AVAILABLE_MODELS, PROVIDER_COLORS } from "@/lib/config/models";

// For message window - no margin since parent div has -ml-2
export const roleIconMap = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
    'ADMIN': <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />,
    'ECHO': <Bot className='h-4 w-4 ml-2 !text-green-500' />
} as const;

const getModelColor = (modelId: string | null): string => {
    if (!modelId) return PROVIDER_COLORS.default;
    
    const model = AVAILABLE_MODELS[modelId];
    if (!model) return PROVIDER_COLORS.default;
    
    return PROVIDER_COLORS[model.provider]?.primary || PROVIDER_COLORS.default;
};

// For components that need the margin built in (like channel members list)
export const getRoleIcon = (role: MemberRole, className?: string, modelId: string | null = null) => {
    const baseStyle = {
        'GUEST': '',
        'MODERATOR': 'text-indigo-500',
        'ADMIN': 'text-rose-500',
        'ECHO': 'text-green-500',
    }[role];

    switch (role) {
        case 'MODERATOR':
            return <ShieldCheck className={cn('h-4 w-4', baseStyle, className)} />;
        case 'ADMIN':
            return <ShieldAlert className={cn('h-4 w-4', baseStyle, className)} />;
        case 'ECHO':
            const modelColor = getModelColor(modelId);
            return <Bot 
                className={cn('h-4 w-4', baseStyle, className)} 
                style={{color: modelColor}} 
            />;
        default:
            return null;
    }
}; 