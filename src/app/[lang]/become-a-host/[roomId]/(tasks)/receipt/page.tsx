"use client"
import { slideUpContainer, slideUpItem } from "@/animations/slideUp.animation";
import Icons from "@/components/Common/Icons";
import Image from "@/components/Common/Image";
import Motion from "@/components/Common/Motion";
import Translate from "@/components/Common/Translate";
import { Discount, RoomStatus } from "@/enum/room";
import { roomCreationSelector } from "@/hooks/selectors/roomSelector";
import useDictionary from "@/hooks/useDictionary";
import useRoomStore from "@/hooks/useRoomStore";
import useToast from "@/hooks/useToast";
import { Dictionary } from "@/libs/dictionary.lib";
import { updateUserRoom } from "@/services/user.service";
import { cn, formatPrice } from "@/utils/dom.util";
import { Card, CardFooter, Skeleton } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react"

interface PageProps { 
    params: {
        roomId: string;
    }
}

const Page: React.FC<PageProps> = ({
    params: {
        roomId
    }
}) => {
    const { t, d } = useDictionary<"become-a-host", Dictionary["become-a-host"]["receipt"]>("become-a-host", d => d.receipt);
    const {
        room,
        roomCreationPathnames: { backTask, nextTask },
        setIsBackLoading,
        setIsNextLoading,
        onResetRoomCreation,
        setValues,
    } = useRoomStore(roomCreationSelector);
    const router = useRouter();
    const { toastRes } = useToast()
    
    const roomSale = useMemo(() => {
        const discountNewPerson = room?.discounts.find((d) => d.conditions === Discount.NEW_USER);
        if (!room || !discountNewPerson) return null;
        const result = Math.round(room.original_price - (discountNewPerson.percent * room.original_price));
        return result
    },[room]);

    useEffect(() => {
        setValues({
            isNextDisabled: false,
            async setNextRoomCreationTask() {
                if (!nextTask) return;
                setIsNextLoading(true);
                const res = await updateUserRoom(roomId, {
                    statusText: RoomStatus.AVAILABLE
                });
                if (!res.ok) {
                    return toastRes(res)
                }
                router.push(nextTask.pathname)
            },
            setBackRoomCreationTask() {
                if (!backTask) return;
                setIsBackLoading(true);
                router.push(backTask.pathname)
            },
        });
        return () => {
            onResetRoomCreation();
        }
    },[
        toastRes,
        setValues,
        setIsBackLoading,
        router,
        backTask,
        setIsNextLoading,
        onResetRoomCreation,
        nextTask,
        roomId
    ])

  return (
    <div className="max-w-[850px] w-full">
        <Motion
            variants={slideUpContainer}
            initial="hidden"
            animate="visible"
        >
            <Motion
                as={"h1"}
                variants={slideUpItem}
                initial="hidden"
                animate="visible"
                className='text-wrap text-title-primary'
            >
                {t("title")}
            </Motion>
            <Motion
                as={"h3"}
                variants={slideUpItem}
                initial="hidden"
                animate="visible"
                className='text-description text-default-400 mt-1.5 md:mt-5'
            >
                {t("description")}
            </Motion>
        </Motion>
        <Motion
            variants={slideUpContainer}
            initial="hidden"
            animate="visible"
            className="w-full mt-10 gap-12 flex flex-col md:flex-row md:justify-between items-center"
        >
            <Card className="relative inline-block w-full md:w-[356px] pt-[70%] md:pt-[40%] pb-12">
                <Skeleton isLoaded={false} className="bg-default-300 absolute z-0 inset-0 mt-4 mx-4 mb-16 rounded-xl" />
                <div className="absolute z-1 inset-0 mt-4 mx-4 mb-16 bg-none">
                    <Image
                        alt="Card background"
                        className="object-cover rounded-xl "
                        src={room?.photos[0]?.url ?? ""}
                        width={324}
                        height={480}
                        radius="md"
                        removeWrapper
                        classNames={{
                            img: "max-h-full w-full md:w-[324px]"
                        }}
                    />
                     <CardFooter 
                        className="p-0 mt-2 text-sm rounded-none flex-col items-start"
                    >
                        <p className="text-subtitle">
                            {room?.title}
                        </p>
                        <div className="mt-1">
                            <span className={cn(
                                !!roomSale ? "line-through text-default-500" : "font-semibold"
                            )}>
                                {formatPrice(room?.original_price ?? 0)}
                            </span>
                            {" "}
                            <span className="font-semibold">
                                {roomSale && formatPrice(roomSale)}
                            </span>
                            {" "}
                            <Translate isTrans isExcLocaleSystem={false} as={"span"}>
                                night
                            </Translate>
                        </div>
                    </CardFooter>
                </div>
            </Card>
                <div className="md:w-[400px]">
                    <h3 className="text-lg md:text-2xl font-medium">
                        {d?.title}
                    </h3>
                    <ul className="mt-6 flex flex-col gap-y-6">
                        <li className="flex justify-start items-start gap-x-4">
                            <span className="inline-block mt-0.5">
                                <Icons.clipboardCheck />
                            </span>
                            <div>
                                <span className="block text-title-accent">
                                    {d?.form.confirm.title}
                                </span>
                                <span className="text-default-500 text-sm">
                                    {d?.form.confirm.description}
                                </span>
                            </div>
                        </li>
                        <li className="flex justify-start items-start gap-x-4">
                            <span className="inline-block mt-0.5">
                                <Icons.calendar width={32} height={32} />
                            </span>
                            <div>
                                <span className="block text-title-accent">
                                    {d?.form.calendar.title}
                                </span>
                                <span className="text-default-500 text-sm">
                                    {d?.form.calendar.description}
                                </span>
                            </div>
                        </li>
                        <li className="flex justify-start items-start gap-x-4">
                            <span className="inline-block mt-0.5">
                                <Icons.pencil />
                            </span>
                            <div>
                                <span className="block md:text-lg font-medium leading-6">
                                    {d?.form.settings.title}
                                </span>
                                <span className="text-default-500 text-sm">
                                    {d?.form.settings.description}
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
        </Motion>
    </div>
  );
};

export default Page;