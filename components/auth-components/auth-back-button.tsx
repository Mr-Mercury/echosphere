'use client'

import { Button } from "../ui/button";
import Link from "next/link";

interface AuthBackButtonProps {
    href: string;
    label: string;
}

export const AuthBackButton = ({
    href, label
}: AuthBackButtonProps) => {
    return (
        <Button variant='link' size='sm' className='font-normal text-foreground w-full' asChild>
            <Link href={href}>
                {label}
            </Link>
        </Button>
    )
}