'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera } from 'lucide-react';
import NavTooltip from '@/components/server-listing-sidebar-components/nav-tooltip';
import { UserProfileEditForm } from '@/components/profile/user-profile-edit-form';

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
    const [displayActualName, setDisplayActualName] = useState(!!userProfile.displayActualName);

    const handleChangePictureClick = () => {
        // TODO: Open modal for image upload
        console.log('Change picture clicked (modal not implemented yet)');
    };

    const handleDisplayActualNameChange = (checked: boolean) => {
        startTransition(() => {
            setDisplayActualName(checked);
            // TODO: Call a server action to update displayActualName preference
            console.log('Display actual name toggled (server action not implemented yet):', checked);
            // Example: updateDisplayPreferenceAction({ displayActualName: checked });
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start space-x-6">
                {userProfile.image && (
                    <div className="relative group rounded-full w-24 h-24 flex-shrink-0">
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
                <div className="flex-grow pt-1">
                    <h4 className="text-xl font-semibold text-zinc-100">{userProfile.username || 'N/A'}</h4>
                    {userProfile.email && <p className="text-sm text-zinc-400 mb-3">{userProfile.email}</p>}
                    
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch 
                            id="displayActualName"
                            checked={displayActualName}
                            onCheckedChange={handleDisplayActualNameChange}
                            disabled={isPending}
                            aria-label="Toggle display actual name"
                        />
                        <Label htmlFor="displayActualName" className="text-sm text-zinc-300 cursor-pointer">
                            Display actual name on profile
                        </Label>
                    </div>
                </div>
            </div>

            <Separator className="bg-zinc-700" />

            <UserProfileEditForm 
                currentUsername={userProfile.username}
                currentRealName={userProfile.actualName}
                currentStatusMessage={userProfile.statusMessage}
            />
        </div>
    );
};

export default ProfileForm; 