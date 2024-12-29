"use client";
import React, { useEffect } from 'react';
import Motion from "@/components/Common/Motion";
import { slideUpContainer, slideUpItem } from "@/animations/slideUp.animation";
import { Textarea } from "@nextui-org/input";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import useRoomStore from "@/hooks/useRoomStore";
import { roomCreationSelector } from "@/hooks/selectors/roomSelector";
import { useRouter } from "next/navigation";
import { updateUserRoom } from "@/services/user.service";
import useToast from "@/hooks/useToast";
import { RoomStatus } from '@/enum/room';

interface TitlePageProps {
    params: {
        roomId: string;
    }
}

const TitlePage: React.FC<TitlePageProps> = ({ params: { roomId } }) => {
    const { t } = useDictionary<"become-a-host", Dictionary["become-a-host"]["title"]>("become-a-host", d => d.title);
    const [inputValue, setInputValue] = React.useState("");
    const maximumValueLength = 32;
    const router = useRouter();
    const { toastRes } = useToast();
    const {
        roomCreationPathnames: { nextTask, backTask },
        onResetRoomCreation,
        setIsBackLoading,
        setIsNextLoading,
        setValues,
        room
    } = useRoomStore(roomCreationSelector)

    useEffect(() => {
        setValues({
            isNextDisabled: inputValue.length < 1,
            async setNextRoomCreationTask() {
                if (!nextTask) return
                setIsNextLoading(true);
                const res = await updateUserRoom(roomId, {
                    title: inputValue,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (!res?.ok) {
                    return toastRes(res)
                }
                router.push(nextTask.pathname);
            },
            setBackRoomCreationTask() {
                setIsBackLoading(true);
                if (!backTask) return;
                router.push(backTask.pathname);
            }
        })
        return () => {
            onResetRoomCreation()
        }
    }, [
        onResetRoomCreation,
        router,
        setValues,
        inputValue,
        toastRes,
        roomId,
        setIsBackLoading,
        backTask,
        nextTask,
        setIsNextLoading
    ]);

    useEffect(() => {
        if (room?.title) {
            setInputValue(room.title);
        }
    }, [room]);

    return (
        <div className={'max-w-[640px] w-full'}>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
                className={"relative"}
            >
                <Motion
                    as={"h1"}
                    className='text-wrap text-title mb-1.5'
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                >
                    {t("title")}
                </Motion>
                <Motion
                    as={"span"}
                    className='text-description text-default-400'
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                >
                    {t("description")}
                </Motion>
            </Motion>
            <Motion
                variants={slideUpItem}
                initial="hidden"
                animate="visible"
                className={"w-full mt-7"}
            >
                <Textarea
                    fullWidth
                    variant={"bordered"}
                    className={"text-2xl"}
                    size={"lg"}
                    classNames={{
                        input: "px-3 py-4 text-xl"
                    }}
                    autoFocus
                    minRows={5}
                    onValueChange={(value) => {
                        if (value.length <= maximumValueLength) {
                            setInputValue(value)
                        }
                    }}
                    value={inputValue}
                />
                <span className={'inline-block mt-2 ml-1 text-description text-default-400'}>
                    {inputValue.length}/{maximumValueLength}
                </span>
            </Motion>
        </div>
    );
}
    ;

export default TitlePage;