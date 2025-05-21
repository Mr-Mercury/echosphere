import { NextResponse } from 'next/server';
import { fetchBotTemplatesWithFilters } from '@/lib/utilities/data/fetching/botTemplates';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '9', 10);
    const sort = searchParams.get('sort') as 'popular' | 'rating' | 'recent' || 'popular';
    const model = searchParams.get('model') || undefined;
    const searchQuery = searchParams.get('searchQuery') || undefined;
    const creatorId = searchParams.get('creatorId') || undefined;

    try {
        const result = await fetchBotTemplatesWithFilters({
            page,
            pageSize,
            sort,
            model,
            searchQuery,
            creatorId,
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in /api/bot-templates/filter:', error);
        return NextResponse.json({ error: 'Failed to fetch bot templates' }, { status: 500 });
    }
} 