import SettingsNavigation from "@/components/settings-components/settings-navigation";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full w-full">
            <SettingsNavigation />
            <main className="flex-1 p-6 bg-zinc-900 text-white">
                {children}
            </main>
        </div>
    );
} 