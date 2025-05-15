import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { fetchBotTemplatesWithFilters } from '@/lib/utilities/data/fetching/botTemplates';

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const sort = url.searchParams.get('sort') as 'popular' | 'rating' | 'recent' || 'popular';
    const model = url.searchParams.get('model') || 'All Models';
    const searchQuery = url.searchParams.get('searchQuery') || '';

    // Validate parameters
    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Fetch data using the utility function
    const result = await fetchBotTemplatesWithFilters({
      page,
      pageSize,
      sort,
      model,
      searchQuery
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bot templates API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot templates' },
      { status: 500 }
    );
  }
} 