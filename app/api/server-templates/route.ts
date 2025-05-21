import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { db } from "@/lib/db/db";
import { NextResponse } from "next/server";
import { ServerTemplateCreateSchema } from "@/zod-schemas";
import { ZodError } from "zod";

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

        // Prepare data for Prisma create
        const createData: any = {
            creatorId: user.id,
            serverName,
            description,
            serverImageUrl,
            channels, // Prisma will store this as JSON
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
            // This catch block might be redundant if safeParse is used above,
            // but kept for robustness or if direct parse was used elsewhere.
            return new NextResponse(`Validation Error: ${error.message}`, { status: 400 });
        }
        console.log('!!!SERVER TEMPLATE POST ERROR!!!', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 