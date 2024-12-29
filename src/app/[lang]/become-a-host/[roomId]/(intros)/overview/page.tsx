"use client";
import Image from '@/components/Common/Image';
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import useDictionary from '@/hooks/useDictionary';
import useRoomStore from '@/hooks/useRoomStore';
import { Dictionary } from '@/libs/dictionary.lib';
import { cn } from '@/utils/dom.util';
import { useRouter } from 'next/navigation';
import { Fragment, useLayoutEffect, useMemo } from 'react';

const OverviewPage = ({
    params: {
        roomId
    }
}: {
    params: {
        roomId: string
    }
}) => {

    const route = useRouter();
    const { d } = useDictionary<"become-a-host", Dictionary["become-a-host"]["overview"]>("become-a-host", (d) => d.overview);
    const {
        roomCreationPathnames: { nextTask },
        setIsNextLoading,
        setValues,
        onResetRoomCreation
    } = useRoomStore(roomCreationSelector);

    const sections = useMemo(() => {
        return Object.keys(d?.items || {}).map((key) => (
            d?.items ? { ...d.items[key as keyof typeof d.items], img: `/images/become-a-host/${key}.webp` } : []
        ))
    }, [d]);

    useLayoutEffect(() => {
        setValues({
            setNextRoomCreationTask: async () => {
                if (!nextTask) return;
                setIsNextLoading(true);
                route.push(nextTask?.pathname);
            }
        });
        return () => {
            onResetRoomCreation();
        }
    }, [
        roomId,
        setIsNextLoading, 
        route, 
        nextTask, 
        onResetRoomCreation, 
        setValues
    ]);

    return (
        <div className='md:content-center h-full'>
            <div className='h-fit'>
                <div className='md:inline-block md:align-middle md:w-1/2'>
                    <div className='w-fit mb-6 md:mb-0 md:mx-auto'>
                        <h1 className='text-title-primary md:max-w-[514px]'>
                            It’s easy to get started on Airbnb
                        </h1>
                    </div>
                </div>
                <div className='md:inline-block md:align-middle md:w-1/2 md:pl-16'>
                    <div className='md:w-fit md:pl-2 pr-[12px]'>
                        {
                            sections.map((section: any, index) => (
                                <Fragment key={index}>
                                    <section className={cn(
                                        'flex gap-x-4 justify-between items-start md:max-w-[720px] pb-8',
                                        index !== sections.length - 1 && "border-b-1.5",
                                        index !== 0 && "pt-8"
                                    )}>
                                        <span className='text-subtitle'>
                                            {index + 1}
                                        </span>
                                        <div className='flex-1 md:max-w-[448px]'>
                                            <h2 className='text-subtitle'>
                                                {section?.title}
                                            </h2>
                                            <h3 className='text-description inline-block text-accent'>
                                                {section?.description}
                                            </h3>
                                        </div>
                                        <div className='content-center relative'>
                                            <Image
                                                src={section?.img}
                                                className='object-cover size-[76px] md:size-[120px]'
                                                alt={section?.title}
                                            />
                                        </div>
                                    </section>
                                </Fragment>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewPage