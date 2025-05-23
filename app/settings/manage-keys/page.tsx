import { AVAILABLE_MODELS, PROVIDER_COLORS } from "@/lib/config/models";
import ApiKeyManager from "@/components/settings-components/api-key-manager";

export interface ProviderData {
    name: string;
    color: string;
    // We can add a list of associated model names here if we want to display them for context
    // modelNames: string[]; 
}

export default async function ManageApiKeysPage() {
    const uniqueProviders: Record<string, ProviderData> = {};

    for (const modelId in AVAILABLE_MODELS) {
        const model = AVAILABLE_MODELS[modelId];
        if (model.provider && !uniqueProviders[model.provider]) {
            const providerKey = model.provider.toLowerCase() as keyof typeof PROVIDER_COLORS;
            const colorEntry = PROVIDER_COLORS[providerKey];
            let finalColor: string;
            if (typeof colorEntry === 'object' && colorEntry !== null && 'primary' in colorEntry) {
                finalColor = colorEntry.primary;
            } else {
                finalColor = PROVIDER_COLORS.default; // Default is a string
            }
            uniqueProviders[model.provider] = {
                name: model.provider.charAt(0).toUpperCase() + model.provider.slice(1),
                color: finalColor,
            };
        }
    }

    const preferredOrder = ['Google', 'OpenAI', 'Anthropic']; // Define your desired order

    const providerList = Object.values(uniqueProviders).sort((a, b) => {
        const indexA = preferredOrder.indexOf(a.name);
        const indexB = preferredOrder.indexOf(b.name);

        if (indexA !== -1 && indexB !== -1) { // Both are in preferred order
            return indexA - indexB;
        }
        if (indexA !== -1) { // Only A is in preferred order, so A comes first
            return -1;
        }
        if (indexB !== -1) { // Only B is in preferred order, so B comes first
            return 1;
        }
        // Neither is in preferred order, sort alphabetically
        return a.name.localeCompare(b.name);
    });

    // TODO: Fetch existing API keys for the current user for these providers.

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-100">Manage API Keys</h3>
                <p className="text-sm text-zinc-400">
                    Add your personal API keys for supported AI providers. These keys will be used by your bots for all models from that provider.
                </p>
            </div>
            <ApiKeyManager providers={providerList} />
        </div>
    );
} 