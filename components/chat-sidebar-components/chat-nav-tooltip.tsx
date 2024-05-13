'use client';

import { Tooltip, TooltipContent, 
    TooltipProvider, TooltipTrigger } from "../ui/tooltip";

    interface NavTooltipProps {
    label: string;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
}

const NavTooltip = ({ label, children, side, align }: NavTooltipProps) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} align={align} className='bg-black text-white rounded'>
                    <p className='font-semibold text-sm capitalize'>
                        {label.toLowerCase()}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default NavTooltip;