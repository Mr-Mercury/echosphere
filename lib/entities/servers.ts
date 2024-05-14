import { Server, Member, User } from "@prisma/client"


export type ServerWithMembersAndProfiles = Server & {
    members: (Member & { user: User })[];
}