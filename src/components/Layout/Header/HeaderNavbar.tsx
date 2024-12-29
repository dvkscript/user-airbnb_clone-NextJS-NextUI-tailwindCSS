"use client";
import useUrl from '@/hooks/useUrl';
import { cn } from '@/utils/dom.util';
import { Route } from 'next';
import Link from 'next/link';
import React from 'react';

interface HeaderNavbarProps {
    items: {
        path: Route;
        name: string;
    }[];
    pathIndex: number;
    className?: string;
}

const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
    items,
    pathIndex,
    className
}) => {
    const { pathnames } = useUrl();

    return (
        <ul className={cn(className)}>
            {
                items.map((item, index) => (
                    <li key={index}>
                        <Link
                            href={item.path ? item.path : "#!"}
                            className={cn(
                                'relative py-2 px-5 rounded-full',
                                pathnames[pathIndex] === item.path ? "text-default-800" : "text-default-500 hover:bg-default-200"
                            )}
                        >
                            {item.name}
                            {
                                pathnames[pathIndex] === item.path && (
                                    <span className='absolute w-[20px] h-[2px] bg-default-900 bottom-0 left-[50%] translate-x-[-50%]'></span>
                                )
                            }
                        </Link>
                    </li>
                ))
            }
        </ul>
    );
};

export default HeaderNavbar;