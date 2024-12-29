"use client";
import React, {useEffect, useState} from 'react';
import {slideUpContainer, slideUpItem} from "@/animations/slideUp.animation";
import Translate from "@/components/Common/Translate";
import useDictionary from "@/hooks/useDictionary";
import {Dictionary} from "@/libs/dictionary.lib";
import Motion from "@/components/Common/Motion";
import {Button} from "@nextui-org/react";
import Icons from "@/components/Common/Icons";
import {cn} from "@/utils/dom.util";
import useRoomStore from "@/hooks/useRoomStore";
import {roomCreationSelector} from "@/hooks/selectors/roomSelector";
import {useRouter} from "next/navigation";
import useToast from "@/hooks/useToast";
import {updateUserRoom} from "@/services/user.service";
import { RoomStatus } from '@/enum/room';

const InstantBookPage = ({ params: {roomId} }: {params: {roomId: string}}) => {
    const {t, d} = useDictionary<"become-a-host", Dictionary["become-a-host"]["instant-book"]>("become-a-host", d => d["instant-book"]);
    const [instantBook, setInstantBook] = useState(true);
    const {
        room,
        onResetRoomCreation,
        roomCreationPathnames: {nextTask, backTask},
        setIsNextLoading,
        setIsBackLoading,
        setValues
    } = useRoomStore(roomCreationSelector);
    const { toastRes } = useToast()
    const router = useRouter();

    useEffect(() => {
        setValues({
            isNextDisabled: false,
            async setNextRoomCreationTask() {
                if (!nextTask) return;
                setIsNextLoading(true);
                const res = await updateUserRoom(roomId, {
                    instant_book: instantBook,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (!res?.ok) {
                    return toastRes(res)
                }
                router.push(nextTask.pathname)
            },
            setBackRoomCreationTask() {
                if (!backTask) return;
                setIsBackLoading(true);
                router.push(backTask.pathname)
            }
        });
        return () => {
            onResetRoomCreation();
        }
    }, [
        setValues,
        setIsBackLoading,
        setIsNextLoading,
        toastRes,
        roomId,
        instantBook,
        backTask,
        nextTask,
        router,
        onResetRoomCreation
    ]);

    useEffect(() => {
        setInstantBook(room?.instant_book ?? true)
    }, [room]);

    return (
        <div className='max-w-[630px] w-full'>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
            >
                <Motion
                    as={"h1"}
                    initial="hidden"
                    animate="visible"
                    className='text-wrap text-title'
                >
                    {t("title")}
                </Motion>
            </Motion>
            <Translate isTrans className={'mt-10'}>
                <Motion
                    variants={slideUpContainer}
                    initial="hidden"
                    animate="visible"
                    className='flex flex-col gap-y-3 w-full'
                >
                    <Motion
                        variants={slideUpItem}
                        initial="hidden"
                        animate="visible"
                        className={"w-full"}
                    >
                        <Button
                            size={"lg"}
                            variant={"bordered"}
                            fullWidth
                            className={cn(
                                "h-fit p-6 justify-start items-center",
                                instantBook && "border-default-800"
                            )}
                            endContent={<span className={"inline-block ml-auto"}>
                                <Icons.zap />
                            </span>}
                            onPress={() => setInstantBook(true)}
                        >
                            <div className={"text-left"}>
                                <span className={"block text-title-accent"}>
                                    {d?.buttons.true.title}
                                </span>
                                <span  className={"block text-description-accent text-default-500"}>
                                    {d?.buttons.true.description}
                                </span>
                            </div>
                        </Button>
                    </Motion>
                    <Motion
                        variants={slideUpItem}
                        initial="hidden"
                        animate="visible"
                        className={"w-full"}
                    >
                        <Button
                            size={"lg"}
                            variant={"bordered"}
                            fullWidth
                            onPress={() => setInstantBook(false)}
                            className={cn(
                                "h-fit p-6 justify-start items-center",
                                !instantBook && "border-default-800"
                            )}
                            endContent={<span className={"inline-block ml-auto"}>
                                <Icons.messages />
                            </span>}
                        >
                            <div className={"text-left"}>
                                <span className={"block text-lg font-semibold"}>
                                    {d?.buttons.false.title}
                                </span>
                                <span  className={"block text-default-500"}>
                                    {d?.buttons.false.description}
                                </span>
                            </div>
                        </Button>
                    </Motion>
                </Motion>
            </Translate>
        </div>
    );
};

export default InstantBookPage;