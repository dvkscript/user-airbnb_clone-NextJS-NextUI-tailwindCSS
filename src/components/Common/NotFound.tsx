"use client"
import { cn } from '@/utils/dom.util';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next-nprogress-bar';
import React, { FC } from 'react'

interface NotFoundProps {
    className?: string;
}
const NotFound: FC<NotFoundProps> = ({
    className
}) => {
    const route = useRouter();

    return (
        <div
            className={cn(
                'flex flex-col justify-center items-center min-h-full min-w-full gap-y-3',
                className
            )}
        >
            <h1 className='font-poetsenone text-7xl text-center'>
                404
                <br />
                Not Found
            </h1>
            <Button
                onPress={() => {
                    route.back();
                }}
                variant='light'
                className='underline font-medium text-xl'
                // startContent={<TfiBackLeft />}
            >
                Go Back
            </Button>
        </div>
    )
}

export default NotFound