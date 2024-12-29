"use client"
import React, {useCallback, useEffect, useMemo, useReducer} from 'react';
import { motion } from "framer-motion";
import { Button, Divider } from '@nextui-org/react';
import useUrl from '@/hooks/useUrl';
import useDictionary from "@/hooks/useDictionary";
import {Dictionary} from "@/libs/dictionary.lib";
import useRoomStore from "@/hooks/useRoomStore";
import {roomCreationSelector} from "@/hooks/selectors/roomSelector";
import {TUpdateUserRoomValidator} from "@/validators/user.validator";
import {useRouter} from "next/navigation";
import {slideUpItem} from "@/animations/slideUp.animation";
import {cn} from "@/utils/dom.util";
import {Minus, Plus} from "lucide-react";
import {updateUserRoom} from "@/services/user.service";
import {toast} from "sonner";
import { RoomStatus } from '@/enum/room';

type FormData = NonNullable<TUpdateUserRoomValidator["floorPlan"]>;

const initialFormData: FormData = {
    guests: 4,
    bedrooms: 1,
    beds: 1,
    bathrooms: 0.5,
}

interface FloorPlanClientProps {
    roomId: string;
}

const FloorPlanClient: React.FC<FloorPlanClientProps> = ({ 
    roomId
}) => {
    const { d } = useDictionary<"become-a-host", Dictionary["become-a-host"]["floor-plan"]>("become-a-host", (d) => d['floor-plan']);
    const { setValues, setIsBackLoading, setIsNextLoading, onResetRoomCreation, roomCreationPathnames: { nextTask, backTask } } = useRoomStore(roomCreationSelector);
    const { room } = useRoomStore(roomCreationSelector)
    const handleSetFormData = <T extends FormData, K extends keyof T>(
        state: FormData, action: { key: K, value: number, max: number, min: number, type: "increment" | "decrement" }
    ) => {
        const { type, min, max, value, key } = action;
        switch (type) {
            case "increment":
                if (value >= max) return state;
                if (key === "bathrooms") {
                    return {
                        ...state,
                        [key]: value + 0.5,
                    };
                } else {
                    return {
                        ...state,
                        [key]: value + 1,
                    }
                }
            case "decrement":
                if (value <= min) return state;
                if (key === "bathrooms") {
                    return {
                        ...state,
                        [key]: value - 0.5,
                    };
                } else {
                    return {
                        ...state,
                        [key]: value - 1,
                    }
                }
            default:
                throw new Error(`Unknown action: ${type}`)
        }
    };

    const [formData, setFormData] = useReducer(handleSetFormData, room?.floorPlan ? {
        ...initialFormData,
        bathrooms: room.floorPlan.bathrooms,
        bedrooms: room.floorPlan.bedrooms,
        beds: room.floorPlan.beds,
        guests: room.floorPlan.guests
    } : initialFormData);

    const route = useRouter();
    const { pathnames, replacePath } = useUrl();
    const currentPageName = useMemo(() => (
        pathnames[pathnames.length - 1]
    ), [pathnames])

    useEffect(() => {
        setValues({
            isNextDisabled: false,
            setBackRoomCreationTask: () => {
                if(!backTask) return;
                setIsBackLoading(true);
                route.push(backTask.pathname);
            },
            setNextRoomCreationTask: async () => {
                if (!nextTask) return;
                setIsNextLoading(true);
                const result = await updateUserRoom(roomId, {
                    floorPlan: formData,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (result.ok) {
                    route.push(nextTask.pathname);
                } else {
                    setIsNextLoading(false);
                    toast.error(result.message);
                }
            }
        });
        return () => {
            onResetRoomCreation();
        };
    },[
        formData, 
        setValues,
        setIsBackLoading,
        route,
        replacePath,
        currentPageName,
        setIsNextLoading,
        roomId,
        onResetRoomCreation,
        nextTask,
        backTask
    ]);

    const OptionEl = useCallback(({ name, value, max, min }: { name: keyof typeof formData, value: number, min: number, max: number }) => {

        return (
            <div className='flex justify-between items-center w-full py-4'>
                <span className='text-description'>{d?.items?.[name as keyof typeof d.items]}</span>
                <div className='flex-[0_0_6.5rem] flex justify-between items-center ml-auto'>
                    <Button
                        isIconOnly
                        radius='full'
                        size='sm'
                        variant='bordered'
                        disableRipple
                        onPress={() => setFormData({
                            type: "decrement",
                            key: name,
                            value,
                            min,
                            max
                        })}
                        className={cn(value <= min && "cursor-not-allowed opacity-30 hover:opacity-30")}
                    >
                        <Minus size={15} strokeWidth={2.5} />
                    </Button>
                    <span>
                        {name === "guests" && value === max ? `${value}+` : value}
                    </span>
                    <Button
                        radius='full'
                        size='sm'
                        variant='bordered'
                        isIconOnly
                        disableRipple
                        onPress={() => setFormData({
                            type: "increment",
                            key: name,
                            value,
                            min,
                            max
                        })}
                        className={cn(value >= max && "cursor-not-allowed opacity-30 hover:opacity-30")}
                    >
                        <Plus size={15} strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
        )
    },[d]);

    return (
        <div className={"max-w-[640px]"}>
            <motion.div
                variants={slideUpItem}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 className='text-wrap text-title'>
                    {d?.title}
                </motion.h1>
                <motion.span className='text-description text-default-500 inline-block pt-1.5'>
                    {d?.description}
                </motion.span>
            </motion.div>

            <motion.div
                variants={slideUpItem}
                initial="hidden"
                className='w-full mt-7'
                animate="visible"
            >
                <OptionEl name='guests' value={formData.guests} max={16} min={1} />
                <Divider />
                <OptionEl name='bedrooms' value={formData.bedrooms} max={50} min={0} />
                <Divider />
                <OptionEl name='beds' value={formData.beds} max={50} min={1} />
                <Divider />
                <OptionEl name='bathrooms' value={formData.bathrooms} max={50} min={0.5} />
                <Divider />
            </motion.div>
        </div>
    );
};

export default FloorPlanClient;