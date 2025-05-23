'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const getTitleFromPath = (pathname: string): string => {
    if (pathname.startsWith('/settings/')) {
        const section = pathname.split('/settings/')[1];
        if (section && section.length > 0) {
            if (section.includes('/')) {
                // Handle deeper paths if necessary, e.g., /settings/profile/edit -> Profile Edit
                return section.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '); 
            }
            return section.charAt(0).toUpperCase() + section.slice(1);
        }
    }
    return 'Settings'; // Default title
};

export const SettingsHeader = () => {
    const pathname = usePathname();
    const title = getTitleFromPath(pathname);

    return (
        <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 border-b border-zinc-700 mb-6">
            <div className="relative flex items-center px-4 h-14">
                <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold text-zinc-100">
                    {title}
                </h1>
                
                <div className="flex-1 flex justify-end items-center">
                    {/* Placeholder for any potential right-side actions in the future */}
                </div>
            </div>
        </div>
    );
}; 