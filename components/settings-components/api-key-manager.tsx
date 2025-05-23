'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { ProviderData } from '@/app/settings/manage-keys/page'; // Importing the interface from the page

interface ApiKeyManagerProps {
    providers: ProviderData[];
    // We would also pass existingUserKeys here later, e.g., existingUserKeys: Record<string, string>
}

const ApiKeyManager = ({ providers }: ApiKeyManagerProps) => {
    // State to store API keys, keyed by provider name (e.g., "OpenAI")
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({}); 
    // State to manage visibility of each API key, keyed by provider name
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [isPending, startTransition] = useTransition();

    // Pre-fill API keys if existingUserKeys were passed (example for future use)
    // useEffect(() => {
    //     if (existingUserKeys) {
    //         setApiKeys(existingUserKeys);
    //     }
    // }, [existingUserKeys]);

    const handleInputChange = (providerName: string, value: string) => {
        setApiKeys(prev => ({ ...prev, [providerName]: value }));
    };

    const toggleShowKey = (providerName: string) => {
        setShowKey(prev => ({ ...prev, [providerName]: !prev[providerName] }));
    };

    const handleSaveKey = (providerName: string) => {
        startTransition(() => {
            // TODO: Implement actual save logic (e.g., call server action)
            console.log('Saving API Key (not implemented):', {
                provider: providerName, 
                key: apiKeys[providerName]
            });
            // After successful save, you might want to give user feedback.
        });
    };

    if (!providers || providers.length === 0) {
        return <p className="text-zinc-400">No AI providers available for API key management.</p>;
    }

    return (
        <div className="space-y-8">
            {providers.map(provider => (
                <div key={provider.name} className="p-6 rounded-lg border border-zinc-700 bg-zinc-850/50 shadow-md">
                    <h4 
                        className="text-xl font-semibold mb-1 flex items-center"
                        style={{ color: provider.color }}
                    >
                        <KeyRound className="h-5 w-5 mr-2" /> 
                        {provider.name} API Key
                    </h4>
                    <p className="text-xs text-zinc-400 mb-6">
                        Enter your API key for all {provider.name} models.
                        {/* This section can render models if passed in ProviderData */}
                        {/* {provider.modelNames && provider.modelNames.length > 0 && (
                            <span className="block mt-1">Models: {provider.modelNames.join(', ')}</span>
                        )} */}
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor={provider.name} className="sr-only">
                                {provider.name} API Key
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Input 
                                    id={provider.name}
                                    type={showKey[provider.name] ? 'text' : 'password'}
                                    value={apiKeys[provider.name] || ''}
                                    onChange={(e) => handleInputChange(provider.name, e.target.value)}
                                    placeholder={`Enter your ${provider.name} API Key`}
                                    className="flex-grow bg-zinc-700/80 border-zinc-600 text-zinc-100 focus:ring-indigo-500"
                                    disabled={isPending}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toggleShowKey(provider.name)}
                                    className="border-zinc-600 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                                    disabled={isPending}
                                >
                                    {showKey[provider.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button 
                                    onClick={() => handleSaveKey(provider.name)}
                                    disabled={isPending || !apiKeys[provider.name]}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
                                >
                                    {isPending ? 'Saving...' : 'Save Key'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApiKeyManager; 