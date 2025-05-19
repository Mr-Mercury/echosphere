'use client'

import qs from 'query-string';
import { Server } from '@prisma/client';
import { ServerBotSchema } from "@/zod-schemas";
import { AVAILABLE_MODELS } from '@/lib/config/models';
import { ChatFrequency } from '@/lib/config/chat-variables';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form"
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "../../ui/dialog";

import { registerServerBotAction } from "@/app/actions/register-server-bot";

import { Textarea } from "../../ui/textarea";
import { ScrollArea} from "../../ui/scroll-area";
import { Checkbox } from "../../ui/checkbox";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from 'react';
import { ServerWithMembersAndProfiles } from '@/lib/entities/servers';
import FileUpload from '@/components/islets/uploads/file-upload';
import { Switch } from "../../ui/switch";
import { ChevronDown, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utilities/clsx/utils";

const customDisabledStyles = "!text-secondary !cursor-not-allowed";

// Add styling to override disabled appearance
const CustomStyles = () => (
  <style jsx global>{`
    .${customDisabledStyles.replace(/\s+/g, '.')} {
      color: inherit !important;
      -webkit-text-fill-color: inherit !important;
      cursor: not-allowed !important;
    }
    textarea:disabled, select:disabled, input:disabled {
      color: inherit !important;
      -webkit-text-fill-color: inherit !important;
      cursor: not-allowed !important;
      opacity: 0.7 !important;
      background-color: rgb(39, 39, 42, 0.5) !important;
    }
    .warning-background {
      background-color: rgba(220, 38, 38, 0.1) !important;
      border: 1px solid rgba(220, 38, 38, 0.3) !important;
    }
  `}</style>
);

interface CopyBotModalProps {
    data?: {
        server?: ServerWithMembersAndProfiles;
    }
}

const CopyBotModal = ({ data }: CopyBotModalProps) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [useDefaultImage, setUseDefaultImage] = useState(false);
    const [useTemplateImage, setUseTemplateImage] = useState(true);
    const [templateImageUrl, setTemplateImageUrl] = useState<string>('');
    const [adminServers, setAdminServers] = useState<Server[]>([]);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isLoadingServers, setIsLoadingServers] = useState(false);
    const [isLoadingBotData, setIsLoadingBotData] = useState(false);
    const [originalModel, setOriginalModel] = useState<string>('');
    const { isOpen, onClose, type, data: modalData } = useModal();
    const router = useRouter();
    const params = useParams();

    const isModalOpen = isOpen && type === 'copyBot';
    const templateId = modalData?.templateId;

    // Log when modal data or templateId changes to help with debugging
    useEffect(() => {
        if (isModalOpen) {
            console.log("Modal opened with data:", modalData);
            console.log("Template ID value:", templateId);
            if (!modalData || !modalData.templateId) {
                console.warn("Warning: modalData or templateId is undefined");
            }
        }
    }, [isModalOpen, modalData, templateId]);

    const form = useForm({
        resolver: zodResolver(ServerBotSchema),
        defaultValues: {
            name: '',
            profileDescription: '',
            systemPrompt: '',
            imageUrl: '',
            model: Object.keys(AVAILABLE_MODELS)[0],
            fullPromptControl: false,
            chatFrequency: ChatFrequency.Average,
            ourApiKey: true
        }
    });

    // Fetch admin servers when modal opens (regardless of templateId)
    useEffect(() => {
        if (isModalOpen) {
            console.log("Fetching server data");
            const fetchServerData = async () => {
                setIsLoadingServers(true);
                try {
                    // Fetch servers where user is admin or moderator
                    const { data } = await axios.get('/api/servers/user-admin-servers');
                    console.log("Server data received:", data);
                    setAdminServers(data);
                    
                    // Set the current server as selected if it exists in the admin servers
                    if (data.length > 0) {
                        // If coming from a server context, try to select that server
                        const currentServerId = params?.serverId as string;
                        if (currentServerId) {
                            const currentServer = data.find((server: Server) => server.id === currentServerId);
                            if (currentServer) {
                                setSelectedServer(currentServer);
                            } else {
                                setSelectedServer(data[0]);
                            }
                        } else {
                            setSelectedServer(data[0]);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load admin servers:", error);
                } finally {
                    setIsLoadingServers(false);
                }
            };

            fetchServerData();
        }
    }, [isModalOpen, params]);

    // Fetch bot template data when modal opens and templateId is available
    useEffect(() => {
        if (isModalOpen && templateId) {
            console.log("Fetching template data for id:", templateId);
            const fetchTemplateData = async () => {
                setIsLoadingBotData(true);
                try {
                    // Fetch bot template to copy
                    const query = qs.stringifyUrl({
                        url: '/api/templates/single-template',
                        query: { id: templateId }
                    });

                    console.log("Fetching from URL:", query);
                    const response = await axios.get(query);
                    const templateData = response.data;
                    
                    console.log("Template data received:", templateData);
                    
                    if (!templateData) {
                        console.error("Invalid template data format:", templateData);
                        return;
                    }
                    
                    // Set form values from the fetched data
                    form.setValue('name', templateData.botName || '');
                    form.setValue('model', templateData.modelName || Object.keys(AVAILABLE_MODELS)[0]);
                    form.setValue('profileDescription', templateData.description || '');
                    
                    // Save the original model
                    setOriginalModel(templateData.modelName || Object.keys(AVAILABLE_MODELS)[0]);
                    
                    // Important: Use the original prompt if available, not the system prompt
                    form.setValue('systemPrompt', templateData.prompt || templateData.systemPrompt || '');
                    
                    form.setValue('chatFrequency', templateData.chatFrequency || ChatFrequency.Average);
                    form.setValue('ourApiKey', true); // Default to system API key
                    form.setValue('fullPromptControl', false); // Default to false for new bots

                    // Handle image
                    if (templateData.imageUrl) {
                        setTemplateImageUrl(templateData.imageUrl);
                        setImageUrl(templateData.imageUrl);
                        form.setValue('imageUrl', templateData.imageUrl);
                        setUseTemplateImage(true);
                    } else {
                        setDefaultImage();
                    }
                } catch (error: any) {
                    console.error("Failed to load template data:", error);
                    if (error.response) {
                        console.error("Error response:", error.response.status, error.response.data);
                        
                        // If the template is not found, set default values
                        if (error.response.status === 404) {
                            console.log("Template not found, using mock data");
                            try {
                                console.log("Attempting to use mock API as fallback");
                                const mockQuery = qs.stringifyUrl({
                                    url: '/api/bots/server-bots/mock-single-bot',
                                    query: { id: templateId }
                                });
                                
                                const { data: mockData } = await axios.get(mockQuery);
                                console.log("Mock data received:", mockData);
                                
                                // Set form values from mock data using template structure
                                form.setValue('name', 'New Bot from Template');
                                form.setValue('model', mockData.modelName);
                                form.setValue('profileDescription', mockData.description);
                                // Use the original prompt when available, not the system prompt
                                form.setValue('systemPrompt', mockData.prompt || mockData.systemPrompt);
                                form.setValue('chatFrequency', mockData.chatFrequency);
                                form.setValue('ourApiKey', true);
                                form.setValue('fullPromptControl', mockData.fullPromptControl);
                                
                                // Use a default image
                                setDefaultImage();
                            } catch (mockError) {
                                console.error("Mock API fallback also failed:", mockError);
                                setDefaultImage();
                            }
                        }
                    }
                } finally {
                    setIsLoadingBotData(false);
                }
            };

            fetchTemplateData();
        }
    }, [isModalOpen, templateId, form, modalData]);

    // Prefill the form with basic data from modalData when it's first available
    useEffect(() => {
        if (isModalOpen && modalData?.templateId && !form.getValues('name')) {
            console.log("Using template ID as fallback:", modalData.templateId);
            
            // Pre-populate with basic information
            form.setValue('name', 'New Bot from Template');
            setDefaultImage();
        }
    }, [isModalOpen, modalData, form]);

    const setDefaultImage = () => {
        const defaultImageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg';
        setImageUrl(defaultImageUrl);
        setTemplateImageUrl(defaultImageUrl);
        form.setValue('imageUrl', defaultImageUrl);
    }

    const selectedModel = form.watch('model');
    
    // Check if current model differs from original template model
    const isModelChanged = selectedModel !== originalModel && originalModel !== '';

    const isLoading = isLoadingServers || isLoadingBotData || form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof ServerBotSchema>) => {
        try {
            if (!selectedServer) {
                console.error("No server selected");
                return;
            }

            const result = await registerServerBotAction(val, selectedServer.id, modalData?.templateId);

            if (result.error) {
                // TODO: Add proper error handling/display here
                console.error(result.error);
                return;
            }

            // Clearing 
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = () => {
        form.reset()
        onClose();
    }

    const getMaxSystemPromptLength = (model: string) => {
        return AVAILABLE_MODELS[model]?.maxSystemPromptLength ?? 1000;
    };

    const getCharacterCountDisplay = (currentLength: number, maxLength?: number) => {
        const limit = maxLength ?? getMaxSystemPromptLength(selectedModel);
        return `${currentLength} / ${limit} characters`;
    };

    const handleImageToggle = (checked: boolean) => {
        setUseTemplateImage(checked);
        if (checked) {
            // Use the template's image
            setImageUrl(templateImageUrl);
            form.setValue('imageUrl', templateImageUrl);
        } else {
            // Allow user to upload their own
            setImageUrl('');
            form.setValue('imageUrl', '');
        }
    }

    const handleServerSelect = (server: Server) => {
        setSelectedServer(server);
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <CustomStyles />
            <DialogContent className='bg-black text-white p-0 max-w-2xl overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold'>
                        <div className='flex items-center justify-center'>
                            <span>Create a Bot using this Template</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                {isLoadingServers ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                        <p className="text-xs text-zinc-500 mt-2">Loading servers...</p>
                    </div>
                ) : isLoadingBotData ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                        <p className="text-xs text-zinc-500 mt-2">Loading template configuration...</p>
                    </div>
                ) : (
                <ScrollArea className='max-h-[80vh] px-6'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                            <div className='space-y-8 px-6'>
                                {/* Server Selection Dropdown */}
                                <div className="space-y-2">
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                        Select Server
                                    </FormLabel>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className='focus:outline-none w-full' asChild>
                                            <button className='w-full text-md font-semibold px-3 
                                            flex items-center h-10 border-zinc-700 border
                                            hover:bg-zinc-700/50 transition text-white rounded-md'>
                                                {selectedServer?.name || "Select a server"}
                                                <ChevronDown className='h-5 w-5 ml-auto'/>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='w-56 bg-black text-xs font-medium 
                                        text-neutral-400 space-y-[2px]'>
                                            {adminServers.map((server) => (
                                                <DropdownMenuItem 
                                                    key={server.id}
                                                    onClick={() => handleServerSelect(server)}
                                                    className='px-3 py-2 text-sm cursor-pointer'
                                                >
                                                    <div className="flex items-center">
                                                        {server.imageUrl && (
                                                            <img 
                                                                src={server.imageUrl}
                                                                alt={server.name}
                                                                className="w-6 h-6 rounded-full mr-2"
                                                            />
                                                        )}
                                                        {server.name}
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            
                                <FormField control={form.control} name='name' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                                Bot name
                                        </FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} className='border-0 
                                            focus-visible:ring-0 text-secondary focus-visible:ring-offset-0'
                                            placeholder='Name'
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                
                                {/* Rest of the form remains the same */}
                                <FormField control={form.control} name='profileDescription' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                            Bot Description
                                        </FormLabel>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            This description comes from the template and cannot be modified.
                                        </div>
                                        <FormControl>
                                            <Textarea 
                                                disabled={true} 
                                                className={cn('border-0 focus-visible:ring-0 text-secondary focus-visible:ring-offset-0 resize-none bg-zinc-800/50', customDisabledStyles)}
                                                placeholder='Describe this bot'
                                                {...field}
                                                maxLength={500}
                                                />
                                        </FormControl> 
                                        <FormMessage />
                                        <div className="text-xs text-muted-foreground text-right">
                                            {getCharacterCountDisplay(
                                                field.value?.length ?? 0,
                                                300
                                            )}
                                        </div>
                                    </FormItem>
                                )} 
                                />
                                
                                {/* Rest of the form fields... */}
                                <FormField control={form.control} name='systemPrompt' render={({field}) => (
                                    <FormItem>
                                        <div className='flex items-center justify-between'>
                                            <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                                Bot Prompt
                                            </FormLabel>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            {form.watch('fullPromptControl') ? 
                                                "Full prompt control: Your prompt will be used exactly as written - echoes will not function properly without adding chat instructions." :
                                                ""}
                                            <div className="mt-1">This prompt comes from the template and cannot be modified.</div>
                                        </div>
                                            <FormControl>
                                                <Textarea 
                                                    disabled={true} 
                                                    className={cn('border-0 focus-visible:ring-0 text-secondary focus-visible:ring-offset-0 resize-none bg-zinc-800/50', customDisabledStyles)}
                                                    placeholder='Enter your prompt here'
                                                    rows={15}
                                                    {...field}
                                                    maxLength={AVAILABLE_MODELS[selectedModel]?.maxSystemPromptLength ?? 1000}
                                                    />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground text-right">
                                                {getCharacterCountDisplay(
                                                    field.value?.length ?? 0,
                                                    AVAILABLE_MODELS[selectedModel]?.maxSystemPromptLength ?? 1000
                                                )}
                                            </div>
                                            <FormMessage />
                                    </FormItem>
                                )} 
                                />
                                <FormField control={form.control} name='model' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>Model </FormLabel>
                                        {isModelChanged && (
                                            <div className="text-xs text-rose-500 mb-2">
                                                Warning: This template was created for {originalModel}. Using a different model may affect the bot's behavior.
                                            </div>
                                        )}
                                        <Select disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={cn('border-0 focus:ring-0 ring-offset-0 focus:ring-offset-0 capitalize outline-none', 
                                                    isModelChanged && 'warning-background')}
                                                >
                                                    <SelectValue className='text-secondary'
                                                    placeholder='Select a model'
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='bg-primary text-secondary'>
                                                {Object.entries(AVAILABLE_MODELS).map(([key, model]) => (
                                                    <SelectItem key={key} value={key} className='capitalize'>
                                                        {model.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name='chatFrequency' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>Chat Frequency</FormLabel>
                                        <Select disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className='border-0
                                                    focus:ring-0 ring-offset-0
                                                    focus:ring-offset-0 capitalize outline-none'
                                                >
                                                    <SelectValue className='text-secondary'
                                                    placeholder='Select frequency'
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='bg-primary text-secondary'>
                                                {Object.values(ChatFrequency).map((frequency) => (
                                                    <SelectItem key={frequency} value={frequency} className='capitalize'>
                                                        {frequency.toLowerCase().replace('_', ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between px-2'>
                                        <div className='flex items-center space-x-2'>
                                            <Switch 
                                                checked={useTemplateImage}
                                                onCheckedChange={handleImageToggle}
                                            />
                                            <span className='text-xs text-muted-foreground'>
                                                Use template avatar
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className='flex items-center justify-center text-center'>
                                        <FormField 
                                            control={form.control} 
                                            name='imageUrl' 
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        {useTemplateImage ? (
                                                            <div className='relative w-24 h-24'>
                                                                <img 
                                                                    src={field.value}
                                                                    alt="Template avatar"
                                                                    className='rounded-full w-full h-full object-cover'
                                                                />
                                                            </div>
                                                        ) : (
                                                            <FileUpload 
                                                                endpoint='serverImage' 
                                                                value={field.value}
                                                                onChange={field.onChange} 
                                                            />
                                                        )}
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className='px-6 py-4'>
                                <Button 
                                    disabled={isLoading || !selectedServer} 
                                    variant='secondary'
                                    type="submit"
                                >
                                    {isLoading ? "Creating..." : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default CopyBotModal;