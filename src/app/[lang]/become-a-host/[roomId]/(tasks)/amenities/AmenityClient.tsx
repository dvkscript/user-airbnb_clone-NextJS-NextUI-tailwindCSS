"use client";
import React, { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { GetAmenityAndCountAll } from "@/services/amenity.service";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import { motion } from "framer-motion";
import { slideUpContainer, slideUpItem } from "@/animations/slideUp.animation";
import { Amenity, RoomStatus } from "@/enum/room";
import Image from "@/components/Common/Image";
import { cn } from "@/utils/dom.util";
import useRoomStore from "@/hooks/useRoomStore";
import { roomCreationSelector } from "@/hooks/selectors/roomSelector";
import { useRouter } from "next/navigation";
import { updateUserRoom } from "@/services/user.service";
import Translate from "@/components/Common/Translate";

interface AmenityClient {
    amenities: GetAmenityAndCountAll["rows"];
    roomId: string;
}

const CheckBox = ({ item, onSelected, isSelected }: {
    item: GetAmenityAndCountAll["rows"][number],
    isSelected: boolean,
    onSelected: (id: string) => void
}) => {
    return (<motion.label
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        variants={slideUpItem}
        className={cn(
            "w-full p-4 cursor-pointer border-1.5 select-none flex justify-start items-center sm:flex-col sm:justify-between sm:items-start",
            'rounded-lg transition-shadow duration-300',
            isSelected ? "shadow-[0_0_0_1.5px] shadow-default-800" : "delay-200"
        )}
        onClick={() => onSelected(item.id)}
    >
        <Image
            src={item.url}
            width={45}
            height={45}
            radius='none'
            className={"min-w-[45px]"}
            alt={item.name}
        />
        <span className='font-medium'>
            {item.name}
        </span>
    </motion.label>)
};

const CheckBoxGroup = ({ label, children }: { label: string, children: ReactNode }) => {
    return (
        <motion.div
            variants={slideUpContainer}
            initial="hidden"
            animate="visible"
        >
            <motion.span
                variants={slideUpItem}
                initial="hidden"
                animate="visible"
                className={"text-subtitle"}
            >
                {label}
            </motion.span>
            <Translate isTrans isExcLocaleSystem={false}>
                <motion.div
                    variants={slideUpContainer}
                    initial="hidden"
                    animate="visible"
                    className={"grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 mt-4 w-full"}
                >
                    {children}
                </motion.div>
            </Translate>
        </motion.div>
    )
}

const AmenityClient: React.FC<AmenityClient> = ({ amenities, roomId }) => {
    const { t } = useDictionary<"become-a-host", Dictionary["become-a-host"]["amenities"]>("become-a-host", d => d.amenities);
    const [selectItems, setSelectItems] = useState<string[]>([]);
    const {
        setValues,
        onResetRoomCreation,
        roomCreationPathnames: { nextTask, backTask },
        setIsBackLoading,
        setIsNextLoading,
        room
    } = useRoomStore(roomCreationSelector);
    const router = useRouter();

    const handleSelectItem = useCallback((id: string) => {
        if (selectItems.includes(id)) {
            setSelectItems(selectItems.filter((s) => s !== id));
        } else {
            setSelectItems(Array.from(new Set([...selectItems, id])));
        }
    }, [selectItems]);

    useEffect(() => {
        if (!room || !room.amenities) return;
        const ids = room.amenities.map((a) => a.id);
        setSelectItems(ids)
    }, [room]);

    useEffect(() => {
        setValues({
            isNextDisabled: false,
            async setNextRoomCreationTask() {
                if (!nextTask) return;
                setIsNextLoading(true);
                const result = await updateUserRoom(roomId, {
                    amenity_id: selectItems,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (result.ok) {
                    router.push(nextTask.pathname);
                } else {
                    setIsNextLoading(false);
                }
            },
            setBackRoomCreationTask() {
                if (!backTask) return;
                setIsBackLoading(true)
                router.push(backTask.pathname);
            }
        });
        return () => {
            onResetRoomCreation()
        }
    }, [
        onResetRoomCreation,
        router,
        setValues,
        selectItems,
        backTask,
        nextTask,
        setIsBackLoading,
        setIsNextLoading,
        roomId
    ]);

    return (
        <div className={"max-w-[640px] w-full"}>
            <motion.div
                variants={slideUpItem}
                initial="hidden"
                animate="visible"
                className='max-w-[640px] w-full'
            >
                <motion.h1 className='text-wrap text-title'>
                    {t("title")}
                </motion.h1>
                <motion.span className='text-description text-default-400'>
                    {t("description")}
                </motion.span>
            </motion.div>
            <motion.div
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
                className={"flex flex-col gap-y-4 mt-4"}
            >
                <CheckBoxGroup label={t("subtitle1")}>
                    {amenities.filter(a => a.category === Amenity.CATEGORY_FAVORITE).map(a => {
                        return (<Fragment key={a.id}>
                            <CheckBox onSelected={handleSelectItem} isSelected={selectItems.includes(a.id)}
                                item={a} />
                        </Fragment>)
                    })}
                </CheckBoxGroup>
                <CheckBoxGroup label={t("subtitle2")}>
                    {amenities.filter(a => a.category === Amenity.CATEGORY_STANDOUT).map(a => {
                        return (<Fragment key={a.id}>
                            <CheckBox onSelected={handleSelectItem} isSelected={selectItems.includes(a.id)}
                                item={a} />
                        </Fragment>)
                    })}
                </CheckBoxGroup>
                <CheckBoxGroup label={t("subtitle3")}>
                    {amenities.filter(a => a.category === Amenity.CATEGORY_SAFETY).map(a => {
                        return (<Fragment key={a.id}>
                            <CheckBox onSelected={handleSelectItem} isSelected={selectItems.includes(a.id)}
                                item={a} />
                        </Fragment>)
                    })}
                </CheckBoxGroup>
            </motion.div>
        </div>
    );
};

export default AmenityClient;