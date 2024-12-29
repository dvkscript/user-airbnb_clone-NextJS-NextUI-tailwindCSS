import { getUserRoomAndCountAll } from "@/services/user.service";
import BecomeAHostClient from "./BecomeAHostClient";
import { RoomStatus } from "@/enum/room";

const BecomeAHostPage = async ({
}) => {
    const roomsRes = await getUserRoomAndCountAll({
        limit: "all",
        statusText: `${RoomStatus.CREATING}-`
    });

    if (!roomsRes.ok) {
        throw new Error(roomsRes.status.toString());
    }

    const rooms = roomsRes.data!

    return (
        <BecomeAHostClient rooms={rooms} />
    );
};

export default BecomeAHostPage;