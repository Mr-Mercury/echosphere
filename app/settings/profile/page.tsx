import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/settings-components/profile-form";

// The ProfileForm component expects a userProfile object with fields defined 
// in its UserProfileData interface. This page component fetches the Prisma User model 
// and transforms it into the shape expected by ProfileForm.

export default async function ManageProfilePage() {
    const user = await currentUser(); // Fetches the Prisma User object

    if (!user) {
        return redirect('/'); // Or redirect to login
    }

    // Construct the userProfile object for the ProfileForm component
    const userProfile = {
        id: user.id, 
        username: user.username || "", 
        email: user.email || "",       
        image: user.image || "",         
        actualName: user.name || "",     
        statusMessage: user.statusMessage || "",
        // The 'displayActualName' field is part of ProfileForm's UserProfileData interface,
        // but it's NOT currently a field in the Prisma User model (see schema.prisma).
        // By passing 'undefined' here, ProfileForm's useState hook:
        // `useState(!!userProfile.displayActualName)` will correctly initialize it to `false`.
        // If you add `displayActualName` to your User model, you would source it here, e.g.:
        // displayActualName: user.displayActualName ?? false, 
        displayActualName: undefined,
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-zinc-400">
                Manage your profile information.
            </p>
            <ProfileForm userProfile={userProfile} />
        </div>
    );
} 