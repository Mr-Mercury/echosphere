import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Placeholder function - in a real app, you'd fetch subscription status
async function getUserSubscriptionStatus(userId: string) {
    // const user = await currentUser(); 
    // if (!user) return { plan: 'Unknown', status: 'Error' };
    // const subscription = await db.subscription.findUnique({ where: { userId: user.id } });
    return {
        planName: "Free Tier",
        price: "$0/month",
        renewalDate: null, 
        manageSubscriptionUrl: "https://billing.stripe.com/test_example" // Hardcoded example Stripe portal link
    };
}

export default async function BillingPage() {
    // const user = await currentUser();
    // if (!user) return redirect('/login');
    
    const subscription = await getUserSubscriptionStatus("placeholder-user-id"); 

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-zinc-100">Billing & Subscription</h3>
                <p className="text-sm text-zinc-400">
                    Manage your subscription and payment details.
                </p>
            </div>

            <Separator className="bg-zinc-700" />

            <section className="space-y-4 p-6 rounded-lg border border-zinc-700 bg-zinc-850/50 shadow-md">
                <h4 className="text-xl font-semibold text-zinc-100">Subscription Details</h4>
                <div className="space-y-3 text-sm text-zinc-300">
                    <p><strong>Current Plan:</strong> {subscription.planName}</p>
                    <p><strong>Price:</strong> {subscription.price}</p>
                    {subscription.renewalDate && (
                        <p><strong>Next Renewal:</strong> {subscription.renewalDate}</p>
                    )}
                </div>
                <div className="mt-6">
                    <Button 
                        asChild 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        // Button is enabled if a real URL is provided
                        // disabled={subscription.manageSubscriptionUrl === "#" || !subscription.manageSubscriptionUrl}
                    >
                        <Link href={subscription.manageSubscriptionUrl || "#"} target="_blank" rel="noopener noreferrer">
                            Manage Subscription on Stripe
                        </Link>
                    </Button>
                    {(!subscription.manageSubscriptionUrl || subscription.manageSubscriptionUrl === "#") && (
                        <p className="text-xs text-zinc-500 mt-2">Subscription management portal link not available.</p>
                    )}
                </div>
            </section>

            {/* API Usage Statistics section removed */}
        </div>
    );
} 