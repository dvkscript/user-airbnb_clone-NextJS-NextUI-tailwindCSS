"use client";
import { slideUpContainer, slideUpItem } from '@/animations/slideUp.animation';
import Image from '@/components/Common/Image';
import Motion from '@/components/Common/Motion';
import Translate from '@/components/Common/Translate';
import { PrivacyType, RoomStatus } from '@/enum/room';
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import useDictionary from '@/hooks/useDictionary';
import useRoomStore from '@/hooks/useRoomStore';
import useToast from '@/hooks/useToast';
import useUrl from '@/hooks/useUrl';
import { Dictionary } from '@/libs/dictionary.lib';
import { updateUserRoom } from '@/services/user.service';
import { cn } from '@/utils/dom.util';
import { Button } from '@nextui-org/react';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

interface PrivacyTypePageProps {
    params: Params
}

const PrivacyTypePage: React.FC<PrivacyTypePageProps> = ({
    params: {
        roomId
    }
}) => {

    const {
        setValues,
        onResetRoomCreation,
        setIsBackLoading,
        setIsNextLoading,
        roomCreationPathnames: { backTask, nextTask },
        room
    } = useRoomStore(roomCreationSelector);
    const route = useRouter();
    const { pathnames, replacePath } = useUrl();
    const [selected, setSelected] = useState<string | null>(room?.privacy_type || null);
    
    const { d } = useDictionary<"become-a-host", Dictionary["become-a-host"]["privacy-type"]>("become-a-host", d => d['privacy-type']);
    const { toastRes } = useToast();

    const currentPageName = useMemo(() => (
        pathnames[pathnames.length - 1]
    ), [pathnames])

    useEffect(() => {
        setValues({
            isNextDisabled: !(!!selected),
            setNextRoomCreationTask: async () => {
                if (!nextTask || !selected) return;
                setIsNextLoading(true);
                if (room?.privacy_type && selected === room.privacy_type) {
                    return route.push(nextTask.pathname);
                }
                const result = await updateUserRoom(roomId, {
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`,
                    privacy_type: selected as PrivacyType
                });
                if (result.ok) {
                    route.push(nextTask.pathname);
                } else {
                    setIsNextLoading(false);
                    toastRes(result);
                }
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
        selected,
        backTask,
        toastRes,
        nextTask,
        room
    ]);

    const items = useMemo(() => {
        return Object.values(PrivacyType).map((value) => {
            const isSelected = selected === value;
            const msg = d?.items[value as keyof typeof d.items];
            let imgSrc = "";

            switch (value) {
                case PrivacyType.ENTIRE:
                    imgSrc = "home.png"
                    break;
                case PrivacyType.ROOM:
                    imgSrc = "door.png"
                    break;
                case PrivacyType.SHARED:
                    imgSrc = "sharing.png"
                    break;
                default:
                    break;
            }

            return (
                <Motion
                    key={value}
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                    className='w-full'
                >
                    <Button
                        type='button'
                        className={cn(
                            'w-full h-fit p-5 sm:p-6 justify-between text-left',
                            isSelected && "bg-default-50 border-default-800"
                        )}
                        role="radio"
                        aria-checked={isSelected}
                        variant='bordered'
                        endContent={<Image alt={value ?? ""} src={`/images/become-a-host/privacies/${imgSrc}`} width={36} height={36} className={"min-w-9 min-h-9"} radius='none' />}
                        onPress={() => setSelected(value)}
                        size='lg'
                    >
                        <div className='text-left text-wrap'>
                            <h2 className='text-title-accent'>
                                {msg?.title}
                            </h2>
                            <p className='text-default-600 text-description-accent max-w-[25rem] mt-0.5'>
                                {
                                    msg?.description
                                }
                            </p>
                        </div>
                    </Button>
                </Motion>
            )
        })
    }, [d, selected])

    return (
        <div className='max-w-[640px] w-full'>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
            >
                <Motion as='h1' className='text-wrap text-title'>
                    {d?.title}
                </Motion>
            </Motion>
            <Translate isTrans className={'mt-10'}>
                <Motion
                    variants={slideUpContainer}
                    initial="hidden"
                    animate="visible"
                    className='flex flex-col gap-y-3 w-full'
                >
                    {items}
                </Motion>
            </Translate>
        </div>
    );
};

export default PrivacyTypePage;