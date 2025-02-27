import { Bot, ShieldAlert, ShieldCheck } from "lucide-react";
import { MemberRole } from "@prisma/client";
import { cn } from "@/lib/utilities/clsx/utils";

export const roleIconMap = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
    'ADMIN': <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />,
    'ECHO': <Bot className='h-4 w-4 ml-2 text-green-500' />
} as const;

// For components that need different styling
export const getRoleIcon = (role: MemberRole, className?: string) => {
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
            return <Bot className={cn('h-4 w-4', baseStyle, className)} />;
        default:
            return null;
    }
}; 