import { cn } from "@/lib/utils";

interface AuthHeaderProps {
    label: string;
}

export const AuthHeader = ({
    label
}: AuthHeaderProps) => {
    return (
        <div className='w-full flex flex-col gap-y-4 items-center justify-center'> 
            <h1 className={cn('text-3xl font-semibold',)}>
                Echosphere
            </h1>
            <p className='text-muted-foreground text-sm'>
                {label}
            </p>
        </div>
    )
}