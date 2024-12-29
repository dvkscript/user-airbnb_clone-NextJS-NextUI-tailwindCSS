import { getUserRoom } from "@/services/user.service";
import React from "react"
import { RoomStatus } from "@/enum/room";
import LayoutClient from "./LayoutClient";

interface DetailsLayoutProps {
    children: React.ReactNode;
    params: {
        roomId: string;
    }
}

const DetailsLayout = async ({
    children,
    params: {
        roomId
    },
}: DetailsLayoutProps) => {
    const roomRes = await getUserRoom(roomId);

    if (!roomRes.ok) {
        throw new Error(roomRes.status.toString());
    }

    const room = roomRes.data!;

    if (room.statusText.startsWith(RoomStatus.CREATING + "-")) {
        throw new Error("404");
    }

    return (
        <LayoutClient room={roomRes.data}>
            {children}
        </LayoutClient>
    );
};

export default DetailsLayout;