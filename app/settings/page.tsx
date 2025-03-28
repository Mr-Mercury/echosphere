import { auth, signOut } from "@/auth";
import { SettingsContent } from "@/components/settings-components/settings-content";

// NOTE - signout only works in server components
const SettingsPage = async () => {
    const session = await auth();

    return (
        <div className="h-full flex items-center justify-center">
            <div>
                <SettingsContent />
            </div>
        </div>
    );
}

export default SettingsPage;