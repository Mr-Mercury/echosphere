import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/settings-components/profile-form"; // Use ProfileForm
import { Separator } from "@/components/ui/separator";

// The ProfileForm component expects a userProfile object with fields defined 
// in its UserProfileData interface. This page component fetches the Prisma User model 
// and transforms it into the shape expected by ProfileForm.

export default async function ManageProfilePage() {
    const user = await currentUser(); // Fetches the Prisma User object

    if (!user) {
        return redirect('/'); // Or redirect to login
    }

    // Construct the userProfile object for the ProfileForm component
    // This matches the UserProfileData interface expected by ProfileForm
    const userProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        image: user.image,
        actualName: user.name, // Prisma user.name maps to actualName
        statusMessage: user.statusMessage,
        displayActualName: (user as any).displayActualName === undefined ? undefined : !!(user as any).displayActualName,
    };

    return (
        <div className="space-y-8"> 
            <div>
                <h3 className="text-lg font-medium text-zinc-100">Profile Settings</h3>
                <p className="text-sm text-zinc-400">
                    Manage your public profile information.
                </p>
            </div>
            <Separator className="bg-zinc-700"/>
            {/* Render ProfileForm, which will internally use UserProfileEditForm */}
            <ProfileForm userProfile={userProfile} />
        </div>
    );
} 