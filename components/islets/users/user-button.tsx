'use client'
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utilities/clsx/utils";
import NavTooltip from "@/components/chat-sidebar-components/nav-tooltip";
import { usePathname } from "next/navigation";
import { PERSONAL_ROOM_ROUTE } from "@/routes";
import { User } from "@prisma/client";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";

type UserWithImage = User & { image: string};

interface UserButtonProps {
    user: UserWithImage;
};

const UserButton = ({user}: UserButtonProps) => {
    
    const image = user.image;
    const pathname=usePathname();


    return (
        <div>
            <NavTooltip side='right' align='center' label='Direct Messages'>
                <Link href={`/chat/server/personal`}className='group relative flex items-center'>
                <div className={cn
                ('absolute left-0 bg-white rounded-r-full transition-all',
                pathname !== PERSONAL_ROOM_ROUTE && 'group-hover:h-[20px] group-hover:w-[4px]',
                pathname === PERSONAL_ROOM_ROUTE ? 'h-[36px] w-[4px]' : 'h-[0px] w-[0px]')} />
                    <div className='flex mx-3 h-[48px] w-[48px]
                    rounded-[24px] group-hover:rounded-[16px]
                    transition-all overflow-hidden items-center
                    justify-center bg-[#313338]'>
                        <Image src={image}
                        className='group' width={55} height={55}
                        alt='User profile image'/>
                    </div>
                </Link>
            </NavTooltip>
        </div>
    )
}

export default UserButton;