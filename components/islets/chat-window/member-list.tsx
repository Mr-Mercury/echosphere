import { ServerListing } from "../section/server-listing"
import { currentUser } from "@/lib/utilities/data/fetching/currentUser"
import { redirect } from "next/navigation"
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";
import { MemberRole } from "@prisma/client";

interface MemberListProps {
    server: ServerWithMembersAndProfiles;
    role?: MemberRole;
}

export const MemberList = async ({server, role}: MemberListProps) => {

    const user = await currentUser();
    if (!user) return redirect('/');


    if (!server) return redirect('/');

    const members = server.members;

    return (
       <div>{!!members?.length && (
            <div className='mb-2'>
                <ServerListing 
                    sectionType='members' 
                    label='Members'
                    server={server}
                    role={role}
                />
            </div>
        )}
        </div>
    )
}