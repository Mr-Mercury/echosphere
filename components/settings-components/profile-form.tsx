'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Camera } from 'lucide-react';
import NavTooltip from '@/components/server-listing-sidebar-components/nav-tooltip';

// Define a more specific type for the profile data this form expects
interface UserProfileData {
    id: string;
    username?: string | null;
    email?: string | null;
    image?: string | null;
    actualName?: string | null;
    displayActualName?: boolean | null;
    statusMessage?: string | null;
}

interface ProfileFormProps {
    userProfile: UserProfileData;
}

const ProfileForm = ({ userProfile }: ProfileFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [editableUsername, setEditableUsername] = useState(userProfile.username || '');
    const [actualName, setActualName] = useState(userProfile.actualName || '');
    const [displayActualName, setDisplayActualName] = useState(!!userProfile.displayActualName);
    const [statusMessage, setStatusMessage] = useState(userProfile.statusMessage || '');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(() => {
            console.log('Form submitted (not implemented yet):', {
                userId: userProfile.id,
                username: editableUsername,
                actualName,
                displayActualName,
                statusMessage,
            });
        });
    };

    const handleChangePictureClick = () => {
        // TODO: Open modal for image upload
        console.log('Change picture clicked (modal not implemented yet)');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-start space-x-6">
                {userProfile.image && (
                    <div className="relative group rounded-full w-24 h-24">
                        <Image 
                            src={userProfile.image}
                            alt={userProfile.username || "User's profile image"}
                            width={96}
                            height={96}
                            className="rounded-full object-cover aspect-square transition-opacity group-hover:opacity-75"
                        />
                        <NavTooltip label="Change Picture" side="top" align="center">
                            <Button 
                                type="button" 
                                variant="ghost"
                                size="icon"
                                onClick={handleChangePictureClick}
                                className="absolute top-0 right-0 h-8 w-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all hover:bg-black/75"
                                disabled={isPending} 
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </NavTooltip>
                    </div>
                )}
                <div className="flex-grow pt-2">
                    <h4 className="text-xl font-semibold text-zinc-100">{userProfile.username || 'N/A'}</h4>
                    {userProfile.email && <p className="text-sm text-zinc-400 mb-2">{userProfile.email}</p>}
                </div>
            </div>

            <Separator className="bg-zinc-700" />

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="editableUsername" className="text-zinc-300">Username</Label>
                    <Input 
                        id="editableUsername" 
                        value={editableUsername}
                        onChange={(e) => setEditableUsername(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                        disabled={isPending}
                    />
                    <p className="text-xs text-zinc-500">This is your unique username on Echosphere.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="actualName" className="text-zinc-300">Actual Name</Label>
                        <Input 
                            id="actualName" 
                            value={actualName}
                            onChange={(e) => setActualName(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                            disabled={isPending}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                        <Switch 
                            id="displayActualName"
                            checked={displayActualName}
                            onCheckedChange={setDisplayActualName}
                            disabled={isPending}
                            aria-label="Toggle display actual name"
                        />
                        <Label htmlFor="displayActualName" className="text-zinc-300 cursor-pointer">
                            Display actual name on profile
                        </Label>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="statusMessage" className="text-zinc-300">Status Message</Label>
                <Textarea 
                    id="statusMessage"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="What's on your mind?"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500 min-h-[80px]"
                    disabled={isPending}
                />
            </div>

            <Separator className="bg-zinc-700" />

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm; 