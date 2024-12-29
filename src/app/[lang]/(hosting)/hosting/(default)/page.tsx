"use client";
import Container from '@/components/Common/Container';
import { profileSelector } from '@/hooks/selectors/userSelector';
import useUserStore from '@/hooks/useUserStore';
import { Skeleton } from '@nextui-org/react';
import Link from 'next/link';
import React from 'react';

const HostingPage = ({ }) => {

    const { profile } = useUserStore(profileSelector)

    return (
        <Container maxWidth={1440}>
            <div className='flex flex-col gap-y-12 pt-16'>
                <div className='flex justify-between'>
                    <Skeleton
                        isLoaded={!!profile?.full_name}
                        className='rounded-md w-[30rem]'
                    >
                        <h1 className='text-3xl text-title'>Welcome back, {profile?.full_name}</h1>
                    </Skeleton>
                    <Skeleton
                        isLoaded={!!profile?.full_name}
                        className='rounded-md w-fit'
                    >
                        <Link
                            href={"/become-a-host"}
                            className='border-1.5 font-bold border-default-900 text-default-900 px-4 py-1 rounded-lg text-sm flex items-center justify-center'
                        >
                            Complete your listings
                        </Link>
                    </Skeleton>
                </div>
                <div className='font-normal text-2xl' onClick={() => {
                }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, repellendus?</div>
                <div className='font-medium text-2xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, repellendus?</div>
                <div className='font-semibold text-2xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, repellendus?</div>
                <div className='font-bold text-2xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, repellendus?</div>
                <div className='font-extrabold text-2xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, repellendus?</div>
                <div className='font-black text-2xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, repellendus?</div>
            </div>
        </Container>
    );
};

export default HostingPage;