import SettingsNavigation from "@/components/settings-components/settings-navigation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";
import { UserWithImage } from "@/components/islets/users/user-button"; // Assuming this type is exported
import { SettingsHeader } from "@/components/settings-components/settings-header"; // Import the new header

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="flex h-full w-full bg-zinc-900">
            {/* Casting user to UserWithImage. Ensure currentUser() returns compatible data or adjust type. */}
            <SettingsNavigation user={user as UserWithImage} /> 
            <main className="flex-1 flex flex-col overflow-y-auto">
                <SettingsHeader /> {/* Add the header here */}
                <div className="p-6">
                    {children} {/* Content pages will be rendered here */}
                </div>
            </main>
        </div>
    );
} 