"use client"
import Icons from '@/components/Common/Icons';
import useUrl from '@/hooks/useUrl';
import { cn } from '@/utils/dom.util';
import { Button } from '@nextui-org/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useTheme } from "next-themes";

interface BecomeAHostLayoutProps {
    children: React.ReactNode;
    footer: React.ReactNode;
}

const BecomeAHostLayout: React.FC<BecomeAHostLayoutProps> = ({
    children,
    footer
}) => {
    const [isScroll, setIsScroll] = useState<boolean>(false);
    const { pathnames } = useUrl();
    const { setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        if (resolvedTheme !== "light") setTheme("light");
    }, [setTheme, resolvedTheme]);

    return (
        <div className='flex flex-col h-full bg-white dark:bg-neutral-800'>
            <header
                className={cn(
                    "w-full px-6 md:px-11 pt-3 md:pt-7 pb-7 md:pb-3",
                    isScroll && "border-b border-default-300"
                )}
            >
                <div>
                    <div className='hidden md:inline-block w-1/5'>
                        <Link
                            href={"/"}
                            className='p-2 inline-block align-middle'
                        >
                            <Icons.logo />
                        </Link>
                    </div>
                    <div
                        className='flex justify-between flex-row-reverse md:inline-block h-full md:text-right md:align-middle py-2 md:w-4/5'
                    >
                        {
                            !pathnames.includes("overview") && (
                                <Button
                                    size='md'
                                    className='rounded-full h-[40px] text-[14px] font-medium border-1.5 bg-inherit w-fit ml:auto'
                                >
                                    Questions?
                                </Button>
                            )
                        }
                        <Link
                            href={"/hosting"}
                            className='rounded-full text-[14px] py-2 px-4 font-medium border-1.5 bg-inherit md:ml-3'
                        >
                            Exit
                        </Link>
                    </div>
                </div>
            </header >
            <main
                className='max-h-full h-full w-full z-0 scrollbar-none overflow-y-auto px-6 pb-10 md:px-12'
                onScroll={(e) => {
                    setIsScroll(!!e.currentTarget.scrollTop)
                }}
            >
                {children}
            </main>
            {
                (pathnames[2] === "overview" ||
                    !!pathnames[3]) && footer
            }
        </div>
    );
};

export default BecomeAHostLayout;