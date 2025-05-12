import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from '@/lib/config/models';
import { ChatFrequency } from '@/lib/config/chat-variables';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new NextResponse('Missing bot ID', { status: 400 });
        }
        
        // Return mock data for testing
        return NextResponse.json({
            id: `mock-config-${id}`,
            botName: "Mock Bot",
            imageUrl: "https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg",
            botType: "SERVER_BOT",
            systemPrompt: "Enhanced version of prompt with system additions - you normally shouldn't see this directly",
            prompt: "You are a helpful assistant created for testing. Your purpose is to demonstrate the copy functionality in the app.",
            modelName: Object.keys(AVAILABLE_MODELS)[0],
            description: "This is a mock bot for testing purposes.",
            chatFrequency: ChatFrequency.Average,
            messagesPerMinute: 5,
            fullPromptControl: false
        });
    } catch (error) {
        console.log(error);
        return new NextResponse('Failed to fetch mock server bot data', { status: 500 });
    }
} 