import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { fetchServerTemplatesWithFilters } from '@/lib/utilities/data/fetching/serverTemplates';
import { SERVER_EXPLORER_DEFAULTS, SERVER_PAGINATION } from '@/lib/config/server-explorer';

export async function GET(req: Request) {
  try {
    // User authentication/authorization can be added here if needed for specific scenarios
    // const user = await currentUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || SERVER_PAGINATION.PAGE_SIZE.toString());
    const sort = (url.searchParams.get('sort') as 'popular' | 'recent' | 'name') || SERVER_EXPLORER_DEFAULTS.SORT;
    const category = url.searchParams.get('category') || SERVER_EXPLORER_DEFAULTS.CATEGORY;
    const searchQuery = url.searchParams.get('searchQuery') || '';
    const creatorId = url.searchParams.get('creatorId') || undefined; // For "My Templates" filter
    const isPublicParam = url.searchParams.get('isPublic');
    const isPublic = isPublicParam !== null ? isPublicParam === 'true' : true; // Default to true if not specified

    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const result = await fetchServerTemplatesWithFilters({
      page,
      pageSize,
      sort,
      category,
      searchQuery,
      creatorId,
      isPublic,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in server templates API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server templates' },
      { status: 500 }
    );
  }
} 