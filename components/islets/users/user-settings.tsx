import { Settings } from "lucide-react";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import Link from "next/link";
const UserSettings = () => {
    return (
        <NavTooltip label="User Settings & Account Management">
            <Link href={`/settings`}>
                <Settings className='w-5 h-5 text-zinc-400 ml-2 cursor-pointer hover:text-zinc-200 transition'/>
            </Link>
        </NavTooltip>
    )
}

export default UserSettings;