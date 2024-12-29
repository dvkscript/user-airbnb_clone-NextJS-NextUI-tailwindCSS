"use client"
import useUrl from '@/hooks/useUrl';
import React, { useLayoutEffect, useMemo } from 'react';
import useRoomStore from "@/hooks/useRoomStore";
import {roomCreationSelector} from "@/hooks/selectors/roomSelector";
import {useRouter} from "next/navigation";
import useDictionary from "@/hooks/useDictionary";
import {Dictionary} from "@/libs/dictionary.lib";

interface StandOutPageProps {
  params: {
    roomId: string;
}
}

const StandOutPage: React.FC<StandOutPageProps> = ({
  params: {
    roomId
  }
}) => {
  const { setValues, onResetRoomCreation, setIsBackLoading, setIsNextLoading, roomCreationPathnames: { nextTask, backTask } } = useRoomStore(roomCreationSelector);
    const route = useRouter();
    const { pathnames, replacePath } = useUrl();
    const { t } = useDictionary<"become-a-host", Dictionary["become-a-host"]["stand-out"]>("become-a-host", (d) => d['stand-out'])

    const currentPageName = useMemo(() => (
        pathnames[pathnames.length - 1]
    ), [pathnames])
    
    useLayoutEffect(() => {
        setValues({
            isNextDisabled: false,
            setNextRoomCreationTask: async () => {
                if (!nextTask) return;
                setIsNextLoading(true);
                route.push(nextTask.pathname, {
                    scroll: false
                })
            },
            setBackRoomCreationTask: () => {
                if (!backTask) return;
                setIsBackLoading(true);
                route.push(backTask.pathname);
            },
        });
        return () => {
            onResetRoomCreation();
        };
    }, [
        setValues,
        onResetRoomCreation,
        replacePath,
        currentPageName,
        route,
        setIsBackLoading,
        setIsNextLoading,
        roomId,
        backTask,
        nextTask
    ])


  return (
    <div className='lg:content-center h-full'>
        <div className='max-h-fit flex flex-col-reverse lg:block md:px-12'>
            <div className='md:inline-block md:align-middle lg:w-1/2'>
                <div className='lg:max-w-[35rem] ml-auto lg:mr-16'>
                    <span className='text-subtitle'>
                        {t("subtitle")}
                    </span>
                    <h1 className='text-title-primary my-1 lg:my-4'>
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
                        <source src="/videos/become-a-host/stand-out.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>
        </div>
    </div>
);
};

export default StandOutPage;