import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { fetchServerTemplatesWithFilters } from '@/lib/utilities/data/fetching/serverTemplates';
import { SERVER_EXPLORER_DEFAULTS, SERVER_PAGINATION } from '@/lib/config/server-explorer';
import { db } from "@/lib/db/db";
import { ServerTemplateCreateSchema } from "@/zod-schemas";
import { ZodError } from "zod";

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

export async function POST(req: Request) {
    try {
        const user = await currentUser();

        if (!user || !user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const parsedBody = ServerTemplateCreateSchema.safeParse(body);

        if (!parsedBody.success) {
            // Concatenate all error messages for a more informative response
            const errorMessage = parsedBody.error.errors.map(e => e.message).join(', ');
            return new NextResponse(`Invalid input: ${errorMessage}`, { status: 400 });
        }

        const {
            serverName,
            description,
            serverImageUrl,
            channels,
            botTemplateIds,
            isPublic
        } = parsedBody.data;

        const createData: any = {
            creatorId: user.id,
            serverName,
            description,
            serverImageUrl,
            channels, // JSON FORMAT -> See schema.prisma
            isPublic,
        };

        // Handle optional botTemplateIds for Prisma's connect syntax
        if (botTemplateIds && botTemplateIds.length > 0) {
            createData.botTemplates = {
                connect: botTemplateIds.map(id => ({ id }))
            };
        }

        const serverTemplate = await db.serverTemplate.create({
            data: createData
        });

        return NextResponse.json(serverTemplate);

    } catch (error) {
        if (error instanceof ZodError) {
            return new NextResponse(`Validation Error: ${error.message}`, { status: 400 });
        }
        console.log('!!!SERVER TEMPLATE POST ERROR!!!', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 