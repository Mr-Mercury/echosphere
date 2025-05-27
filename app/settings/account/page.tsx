import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { AlertCircle, CheckCircle2, Send, LockKeyhole } from "lucide-react";
import { handleResendConfirmationAction } from "@/app/actions/resend-confirmation";
import { handleChangeEmailAction } from "@/app/actions/change-email";
import { PasswordResetForm } from "../../../components/auth-components/password-reset-form";

// Placeholder function for fetching current user data
async function getAccountDetails() {
    const user = await currentUser();
    if (!user) return null;
    return { email: user.email, emailVerified: user.emailVerified };
}

export default async function AccountSettingsPage() {
    const account = await getAccountDetails();

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm text-zinc-400">
                    Manage your email address and account verification status.
                </p>
            </div>

            <Separator className="bg-zinc-700" />

            {/* Section 1: Email Verification Status */}
            <section className="space-y-3 p-6 rounded-lg border border-zinc-700 bg-zinc-850/50 shadow-md">
                <h4 className="text-xl font-semibold text-zinc-100 mb-2">Email Verification</h4>
                {account?.emailVerified ? (
                    <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Your email address <span className="font-medium">({account.email})</span> is verified.</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 text-yellow-400">
                        <AlertCircle className="h-5 w-5" />
                        <span>Your email address <span className="font-medium">({account?.email || 'N/A'})</span> is not verified.</span>
                    </div>
                )}
                {!account?.emailVerified && account?.email && (
                    <form action={handleResendConfirmationAction} className="mt-4">
                        <Button type="submit" variant="outline" className="text-zinc-300 border-zinc-600 hover:bg-zinc-700 hover:text-zinc-100">
                            <Send className="h-4 w-4 mr-2" />
                            Resend Confirmation Email
                        </Button>
                    </form>
                )}
            </section>

            <Separator className="bg-zinc-700" />

            {/* Section 2: Reset Password */}
            <section className="space-y-3 p-6 rounded-lg border border-zinc-700 bg-zinc-850/50 shadow-md">
                <h4 className="text-xl font-semibold text-zinc-100 mb-1">Reset Password</h4>
                <p className="text-xs text-zinc-400 mb-4">Ensure your account is secure by regularly updating your password.</p>
                <PasswordResetForm />
            </section>

            <Separator className="bg-zinc-700" />   

            {/* Section 3: Change Email Address */}
            <section className="space-y-3 p-6 rounded-lg border border-zinc-700 bg-zinc-850/50 shadow-md">
                <h4 className="text-xl font-semibold text-zinc-100 mb-1">Change Email Address</h4>
                <p className="text-xs text-zinc-400 mb-4">Changing your email will require re-verification.</p>
                <form action={handleChangeEmailAction} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="newEmail" className="text-zinc-300">New Email Address</Label>
                        <Input 
                            id="newEmail" 
                            name="newEmail" 
                            type="email" 
                            placeholder="Enter your new email address"
                            className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                            required
                        />
                    </div>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Request Email Change
                    </Button>
                </form>
            </section>
        </div>
    );
} 