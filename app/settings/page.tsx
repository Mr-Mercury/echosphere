import { auth, signOut } from "@/auth";
import { SettingsContent } from "@/components/settings-components/settings-content";

// NOTE - signout only works in server components
const SettingsPage = async () => {
    const session = await auth();

    return (
        <div>
            <div>
                <SettingsContent />
            </div>
            {JSON.stringify(session)}
            
        </div>
    );
}

export default SettingsPage;