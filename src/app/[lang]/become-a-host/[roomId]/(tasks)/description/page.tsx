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

interface DescriptionPageProps {
    params: {
        roomId: string;
    }
}

const DescriptionPage: React.FC<DescriptionPageProps> = ({ params: { roomId } }) => {

    const maximumValueLength = 500;
    const router = useRouter();
    const { toastRes } = useToast();
    const {
        t,
        d
    } = useDictionary<"become-a-host", Dictionary["become-a-host"]["description"]>("become-a-host", d => d.description);
    const [inputValue, setInputValue] = React.useState("");
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
                if (!nextTask) return;
                setIsNextLoading(true);
                const res = await updateUserRoom(roomId, {
                    description: inputValue,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (!res?.ok) {
                    return toastRes(res)
                }
                router.push(nextTask.pathname);
            },
            setBackRoomCreationTask() {
                if (!backTask) return;
                setIsBackLoading(true);
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
        if (room?.description) {
            setInputValue(room?.description)
        } else if (d?.valueDefault) {
            setInputValue(d.valueDefault)
        }
    }, [d, room]);

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
                    size={"lg"}
                    classNames={{
                        input: "p-3 text-lg"
                    }}
                    autoFocus
                    minRows={7}
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

export default DescriptionPage;