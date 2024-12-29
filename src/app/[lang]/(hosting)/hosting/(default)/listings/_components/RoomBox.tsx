"use client"
import Image from "@/components/Common/Image";
import Translate from "@/components/Common/Translate";
import { locationSelector } from "@/hooks/selectors/systemSelector";
import useSystemStore from "@/hooks/useSystemStore";
import { GetUserRoomAndCountAll } from "@/services/user.service";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import React, { memo } from "react"
import StatusChip from "./StatusChip";

interface RoomBoxProps {
    room: GetUserRoomAndCountAll["rows"][number];
    titleNull: string;
    onClickBox?: (room: RoomBoxProps["room"]) => void;
}

const RoomBox: React.FC<RoomBoxProps> = ({
    room,
    titleNull,
    onClickBox,
}) => {
    const { countries } = useSystemStore(locationSelector);
    return (
        <Card
            shadow="none"
            className="w-full relative z-0"
            radius="md"
            data-focus="false"
            data-focus-visible="false"
            as={"li"}
        >
            <CardBody className="px-0 pb-0 relative pt-[83.8%] h-full z-10 rounded-[inherit]">
                <div className="absolute inset-0 h-full w-full bg-default-200 rounded-[inherit]">
                    {
                        room.photos[0]?.url && (
                            <Image
                                src={room.photos[0]?.url}
                                alt={room.title || ""}
                                radius="none"
                                width="100%"
                                className="w-full object-cover z-0 inset-0 h-full"
                                classNames={{
                                    wrapper: "w-full h-full"
                                }}
                            />
                        )
                    }
                </div>
            </CardBody>
            <CardFooter className="z-0 text-small justify-between flex-col items-start px-0 pt-2 pb-8">
                <Translate as={"span"} className="text-sm font-medium">
                    {room.title || titleNull}
                </Translate>
                <p className="text-default-600 min-h-5">
                    {
                        room.address && (
                            [room.address.province, countries[room.address.country_code as keyof typeof countries].native].join(", ")
                        )
                    }
                </p>
            </CardFooter>
            <StatusChip
                room={room}
                className="absolute top-3 left-3 z-10 py-[0.4375rem] px-3 bg-white text-neutral-800 gap-x-1"
            />
            <button
                type="button"
                onClick={() => {
                    if (onClickBox) onClickBox(room);
                }}
                className="absolute inset-0 z-10 cursor-pointer"
            />
        </Card>
    );
};

export default memo(RoomBox);