"use client"
import { RoomStatus } from '@/enum/room';
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import useDictionary from '@/hooks/useDictionary';
import useRoomStore from '@/hooks/useRoomStore';
import useToast from '@/hooks/useToast';
import { Dictionary } from '@/libs/dictionary.lib';
import { updateUserRoom } from '@/services/user.service';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface AboutYourPlacePageProps {
    params: {
        roomId: string;
    }
}

const AboutYourPlacePage: React.FC<AboutYourPlacePageProps> = ({
    params: {
        roomId
    }
}) => {
    const { onResetRoomCreation, roomCreationPathnames: { backTask, nextTask }, setValues, setIsBackLoading, setIsNextLoading } = useRoomStore(roomCreationSelector)
    const route = useRouter();
    const { t } = useDictionary<"become-a-host", Dictionary["become-a-host"]["about-your-place"]>("become-a-host", (d) => d['about-your-place']);
    const { toastRes } = useToast()

    useEffect(() => {
        
        setValues({
            isNextDisabled: false,
            setNextRoomCreationTask: async () => {
                if (!nextTask) return;
                setIsNextLoading(true);
                const res = await updateUserRoom(roomId, {
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (!res.ok) {
                    return toastRes(res)
                }
                route.push(nextTask.pathname);
            },
            setBackRoomCreationTask: () => {
                if (!backTask) return;
                setIsBackLoading(true);
                route.push(backTask?.pathname);
            },
        });
        return () => {
            onResetRoomCreation();
        };
    }, [
        toastRes,
        route,
        roomId,
        onResetRoomCreation,
        nextTask,
        backTask,
        setIsNextLoading,
        setIsBackLoading,
        setValues,
    ])

    return (
        <div className='lg:content-center h-full'>
            <div className='max-h-fit flex flex-col-reverse lg:block md:px-12'>
                <div className='md:inline-block md:align-middle lg:w-1/2'>
                    <div className='lg:max-w-[35rem] ml-auto lg:mr-16'>
                        <span className='text-subtitle'>
                            {t("subtitle")}
                        </span>
                        <h1 className='text-title-primary font-medium my-1 lg:my-4'>
                            {t("title")}
                        </h1>
                        <p className='text-description text-default-600'>
                            {t("description")}
                        </p>
                    </div>
                </div>
                <div className='lg:inline-block lg:align-middle lg:w-1/2 text-left overflow-hidden'>
                    <div className='max-w-[46.5rem] max-h-[46.5rem] overflow-hidden mx-auto lg:ml-0 p-1' >
                        <video className='overflow-hidden object-cover border-none' autoPlay muted playsInline preload='auto'>
                            <source src="/videos/become-a-host/about-your-place.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutYourPlacePage;

