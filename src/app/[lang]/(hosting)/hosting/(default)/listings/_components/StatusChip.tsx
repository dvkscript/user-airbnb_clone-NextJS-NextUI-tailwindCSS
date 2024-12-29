"use client"
import { RoomStatus } from "@/enum/room";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import { GetUserRoomAndCountAll } from "@/services/user.service";
import { cn } from "@/utils/dom.util";
import { Chip, ChipProps } from "@nextui-org/react";
import React, { useMemo } from "react"

interface StatusChipProps extends Omit<ChipProps, "children"> {
    room: GetUserRoomAndCountAll["rows"][number];
    className?: string;
}

const StatusChip: React.FC<StatusChipProps> = ({
    room,
    className,
    ...props
}) => {
    const statusMsg = useDictionary<"common", Dictionary["common"]["status"]>("common", d => d.status).d;
    const statusText = useMemo(() => {
        if (!statusMsg) return "";
        if (room.statusText.startsWith(RoomStatus.CREATING + "-")) {
            return statusMsg.in_progress
        }
        return statusMsg.active
    }, [statusMsg, room]);

    if (!statusMsg) return null;

    return (
        <Chip
            {...props}
            startContent={
                <span
                    className={cn(
                        "size-2 rounded-full",
                        statusText === statusMsg.active && "bg-green-600",
                        statusText === statusMsg.in_progress && "bg-yellow-600",
                    )}
                />
            }
            className={cn("h-fit", className)}
            classNames={{
                content: "font-medium text-sm px-0",
            }}
        >
            {statusText}
        </Chip>
    );
};

export default StatusChip;