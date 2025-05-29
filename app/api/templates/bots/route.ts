import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { fetchBotTemplatesWithFilters } from '@/lib/utilities/data/fetching/botTemplates';
import { db } from "@/lib/db/db";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Fetch single bot template by ID
      const template = await db.botTemplate.findUnique({
        where: { id: id },
        // You might want to include creator details here if needed by the frontend
        // include: {
        //   creator: {
        //     select: {
        //       name: true,
        //       image: true,
        //     },
        //   },
        // },
      });

      if (!template) {
        return NextResponse.json({ error: 'Bot template not found' }, { status: 404 });
      }
      // TODO: Consider transforming the template to the 'Bot' display type if consistency is needed with other endpoints
      return NextResponse.json(template);
    }

    // Original logic for fetching multiple templates with filters
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const sort = url.searchParams.get('sort') as 'popular' | 'rating' | 'recent' || 'popular';
    const model = url.searchParams.get('model') || 'All Models';
    const searchQuery = url.searchParams.get('searchQuery') || '';
    const creatorId = url.searchParams.get('creatorId') || undefined;

    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const result = await fetchBotTemplatesWithFilters({
      page,
      pageSize,
      sort,
      model,
      searchQuery,
      creatorId
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bot templates API:', error);
    // Check if it's a known error type or provide a generic message
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bot templates';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 