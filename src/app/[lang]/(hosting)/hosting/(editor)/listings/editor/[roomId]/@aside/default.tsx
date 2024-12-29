import { getUserRoom } from "@/services/user.service";
import AsideClient from "./AsideClient";
import { RoomStatus } from "@/enum/room";


interface AsideDefaultProps {
    params: {
        roomId: string;
        lang: string;
    }
}

const AsideDefault = async ({
    params
}: AsideDefaultProps) => {
    const roomRes = await getUserRoom(params.roomId);

    if (!roomRes.ok) {
        throw new Error(roomRes.status.toString());
    }

    const room = roomRes.data!;

    if (room.statusText.startsWith(RoomStatus.CREATING + "-")) {
        throw new Error("404");
    }

    return <AsideClient params={params} room={room} />
};

export default AsideDefault;