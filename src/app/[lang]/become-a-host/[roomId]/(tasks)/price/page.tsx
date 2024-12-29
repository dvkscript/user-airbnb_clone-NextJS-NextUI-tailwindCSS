"use client";
import React, {useEffect, useMemo, useState} from 'react';
import Motion from "@/components/Common/Motion";
import {slideUpContainer, slideUpItem} from "@/animations/slideUp.animation";
import useDictionary from "@/hooks/useDictionary";
import {Dictionary} from "@/libs/dictionary.lib";
import {Divider} from "@nextui-org/react";
import {Pencil} from "lucide-react";
import {formatPrice} from "@/utils/dom.util";
import useRoomStore from "@/hooks/useRoomStore";
import {roomCreationSelector} from "@/hooks/selectors/roomSelector";
import {useRouter} from "next/navigation";
import {updateUserRoom} from "@/services/user.service";
import useToast from "@/hooks/useToast";
import { RoomStatus } from '@/enum/room';

const PricePage = ({params: {roomId}}: { params: { roomId: string } }) => {

    const {t, d} = useDictionary<"become-a-host", Dictionary["become-a-host"]["price"]>("become-a-host", d => d.price);
    const [inputValue, setInputValue] = useState<number>(21);
    const {
        room,
        calculateRoomPricing,
        setIsNextLoading,
        setIsBackLoading,
        onResetRoomCreation,
        roomCreationPathnames: {nextTask, backTask},
        setValues,
    } = useRoomStore(roomCreationSelector);
    const { toastRes } = useToast()
    const router = useRouter();

    const {basePrice, totalCost, serviceFee, hostEarnings} = useMemo(() => {
        const { basePrice, serviceFee, totalCost, hostEarnings } = calculateRoomPricing(inputValue, room?.fee);
        return {
            basePrice: formatPrice(basePrice),
            serviceFee: formatPrice(serviceFee),
            totalCost: formatPrice(totalCost),
            hostEarnings: formatPrice(hostEarnings)
        }
    }, [inputValue, calculateRoomPricing, room]);

    useEffect(() => {
        setValues({
            isNextDisabled: inputValue < 10,
            async setNextRoomCreationTask() {
                if (!nextTask) return;
                setIsNextLoading(true);
                const res = await updateUserRoom(roomId, {
                    original_price: inputValue,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (!res.ok) {
                    return toastRes(res);
                }
                router.push(nextTask.pathname);
            },
            setBackRoomCreationTask() {
                if (!backTask) return;
                setIsBackLoading(true);
                router.push(backTask.pathname)
            }
        })
        return () => {
            onResetRoomCreation()
        }
    }, [
        toastRes,
        onResetRoomCreation,
        setValues,
        router,
        backTask,
        setIsBackLoading,
        roomId,
        nextTask,
        inputValue,
        setIsNextLoading
    ]);

    useEffect(() => {
        if (room && +room.original_price && +room.original_price !== 0) {
            setInputValue(+room.original_price)
        }
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
                <Motion
                    as={"h3"}
                    initial="hidden"
                    animate="visible"
                    className='text-description text-default-400 mt-1'
                >
                    {t("description")}
                </Motion>
            </Motion>
            <Motion
                variants={slideUpItem}
                initial="hidden"
                animate="visible"
                className='flex flex-col gap-y-3 justify-center items-center mt-7 w-fit mx-auto'
            >
                <div className={'relative max-w-full flex items-center justify-center gap-x-0 w-fit text-[110px] font-bold'}>
                    <label htmlFor={"input-price"} className={"align-middle"}>
                        $
                    </label>
                    <label htmlFor={"input-price"} className={"relative overflow-hidden"}>
                        <span className={"relative align-top select-none whitespace-pre z-1"}>
                            {basePrice}
                        </span>
                        <input
                            id={"input-price"}
                            type={"text"}
                            value={parseInt(inputValue.toString()).toLocaleString("en-US")}
                            onChange={(e) => {
                                const value = parseInt(e.currentTarget.value.replace(/,/g, ''));
                                if (isNaN(value) || value < 0) {
                                    setInputValue(0);
                                } else if (value > 10000) {
                                    setInputValue(10000);
                                } else {
                                    setInputValue(value);
                                }
                            }}
                            autoComplete={"off"}
                            className={"absolute border-none outline-none focus:outline-none top-0 left-0 p-0 m-0 w-full text-center"}
                        />
                    </label>
                    <label htmlFor={"input-price"} className={"align-middle border-2 rounded-full ml-2 p-2"}>
                        <Pencil size={20}/>
                    </label>
                </div>
                <div className={"border-2 border-default-800 rounded-xl py-5 px-4 w-full min-w-[20rem] text-description"}>
                    <div className={'flex justify-between items-center'}>
                        <span>{d?.form.origin_price}</span>
                        <span>
                            {basePrice}
                        </span>
                    </div>
                    <div className={'flex justify-between items-center mt-2'}>
                        <span>
                            {d?.form.guests_service_fee}
                        </span>
                        <span>
                            {serviceFee}
                        </span>
                    </div>
                    <Divider className={"my-3"}/>
                    <div className={'flex justify-between items-center font-medium'}>
                        <span>
                            {d?.form.guest_price_before_taxes}
                        </span>
                        <span>
                            {totalCost}
                        </span>
                    </div>
                </div>
                <div className={"border-2 border-default-600 rounded-xl p-4 w-full min-w-[20rem] flex justify-between"}>
                    <span>
                        {d?.form.you_earn}
                    </span>
                    <span>
                        {hostEarnings}
                    </span>
                </div>
            </Motion>
        </div>
    );
};

export default PricePage;