// The SettingsLogout component (previously SettingsContent) is no longer needed here
// as the sign-out functionality has been moved to the SettingsNavigation component.

const SettingsPage = async () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <p className="mb-4 text-zinc-400 text-center">
                Select a category from the sidebar to manage your settings.
                <br />
                You can sign out using the button at the bottom of the sidebar.
            </p>
            {/* No direct content here anymore, or you can place a welcome message or overview */}
        </div>
    );
}

export default SettingsPage;