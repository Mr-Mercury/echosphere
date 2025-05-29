import { NextResponse } from 'next/server';
import { fetchPopularBotTemplates } from '@/lib/utilities/data/fetching/botTemplates';

export async function GET() {
    try {
        const popularTemplates = await fetchPopularBotTemplates();
        return NextResponse.json(popularTemplates);
    } catch (error) {
        console.error('Error in /api/templates/bots/popular:', error); // Updated error log path
        return NextResponse.json({ error: 'Failed to fetch popular bot templates' }, { status: 500 });
    }
} 