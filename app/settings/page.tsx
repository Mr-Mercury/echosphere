import { redirect } from 'next/navigation';

export default function SettingsPage() {
    redirect('/settings/profile');
    // The rest of the component will not be rendered due to the redirect.
    return null; // Or an empty fragment, though redirect should prevent rendering.
}