"use client"
import useUrl from '@/hooks/useUrl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from '@/components/Common/Image';
import { Button } from '@nextui-org/react';
import { GetStructureAndCountAll } from '@/services/structure.service';
import useDictionary from '@/hooks/useDictionary';
import { Dictionary } from '@/libs/dictionary.lib';
import { slideUpContainer, slideUpItem } from '@/animations/slideUp.animation';
import Translate from '@/components/Common/Translate';
import { cn } from '@/utils/dom.util';
import useRoomStore from '@/hooks/useRoomStore';
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import { useRouter } from 'next/navigation';
import { updateUserRoom } from '@/services/user.service';
import useToast from '@/hooks/useToast';
import Motion from "@/components/Common/Motion";
import { RoomStatus } from '@/enum/room';

type Structures = GetStructureAndCountAll["rows"];
type Structure = Structures[number];

interface StructureClientProps {
    roomId: string;
    structures: Structures;
}

const StructureClient: React.FC<StructureClientProps> = ({
    roomId,
    structures
}) => {
    const {
        setValues,
        setIsBackLoading,
        setIsNextLoading,
        room,
        roomCreationPathnames: { backTask, nextTask },
        onResetRoomCreation
    } = useRoomStore(roomCreationSelector);

    const route = useRouter();
    const { pathnames, replacePath } = useUrl();
    const [selected, setSelected] = useState<Structure | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(true);
    const { t } = useDictionary<"become-a-host", Dictionary["become-a-host"]["structure"]>("become-a-host", (d) => d.structure);
    const { toastRes } = useToast()

    const handleRadio = useCallback((item: Structure) => {
        setSelected(item);
    }, []);

    const currentPageName = useMemo(() => (
        pathnames[pathnames.length - 1]
    ), [pathnames]);

    useEffect(() => {
        setValues({
            isNextDisabled: !(!!selected || !!room?.structure),
            setNextRoomCreationTask: async () => {
                if (!nextTask || !selected) return;
                setIsNextLoading(true);
                if (selected?.id === room?.structure?.id) {
                    return route.push(nextTask.pathname);
                }

                const result = await updateUserRoom(roomId, {
                    structure_id: selected?.id,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (result.ok) {
                    route.push(nextTask.pathname);
                } else {
                    toastRes(result)
                    setIsNextLoading(false);
                }
            },
            setBackRoomCreationTask: () => {
                if (!backTask) return;
                setIsBackLoading(true);
                route.push(backTask.pathname);
            },
        });
        return () => {
            onResetRoomCreation()
        }
    }, [
        setValues,
        replacePath,
        currentPageName,
        route,
        setIsBackLoading,
        setIsNextLoading,
        selected,
        roomId,
        room,
        nextTask,
        backTask,
        toastRes,
        onResetRoomCreation
    ]);
    
    useEffect(() => {
        if (room?.structure) {
            setSelected(room.structure)
        }
    }, [room])

    const radioGroup = useMemo(() => {
        return structures.map((item: Structure) => {
            const isSelected = (!!selected && item.id === selected.id);
            
            return (
                <Motion
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    variants={slideUpItem}
                    className={"w-full"}
                >
                    <Button
                        type='button'
                        role='radio'
                        variant={"bordered"}
                        onPress={() => handleRadio(item)}
                        aria-checked={isSelected}
                        fullWidth
                        isDisabled={!isLoaded}
                        startContent={(
                            <Image
                                src={item.photo}
                                width={30}
                                height={30}
                                radius='none'
                                className={'min-w-[30px]'}
                                alt={item.name}
                                onLoad={(isLoaded) => setIsLoaded(!isLoaded)}
                            />
                        )}
                        className={cn(
                            "sm:flex-col h-fit justify-start sm:justify-between sm:items-start p-4 font-medium text-left transition-colors",
                            !isLoaded && "animate-pulse",
                            isSelected && "border-default-800",
                        )}
                    >
                        {item.name}
                    </Button>
                </Motion>
            )
        })
    }, [selected, handleRadio, isLoaded, structures])

    return (
        <div className='max-w-[640px]'>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
            >
                <Motion
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                    as={"h1"}
                    className='text-left text-wrap text-title'
                >
                    {t("title")}
                </Motion>
            </Motion>
            <Translate isTrans className={"mt-4"}>
                <Motion
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                    className='grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5 h-fit w-full'
                >
                    {radioGroup}
                </Motion>
            </Translate>
        </div>
    )
};

export default StructureClient;