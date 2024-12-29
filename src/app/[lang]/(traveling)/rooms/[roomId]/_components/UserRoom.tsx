"use client"
import Translate from "@/components/Common/Translate";
import useDictionary from "@/hooks/useDictionary";
import { GetRoomDetail } from "@/services/room.service";
import { User } from "@nextui-org/react";
import React, { useMemo } from "react"

interface UserRoomProps {
    user: GetRoomDetail["user"]
}

const UserRoom: React.FC<UserRoomProps> = ({
    user
}) => {
    const expMsg = useDictionary("rooms", d => d.user.experienced).t;
    const userMsg = useDictionary("rooms", d => d.user).t;

    const userExp = useMemo(() => {
        const remainingSeconds = Math.floor(user.exp / 1000);

        if (remainingSeconds <= 0) return "No time remaining";

        const days = Math.floor(remainingSeconds / (24 * 60 * 60));
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        const remainingDays = days % 30;
        const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));

        if (years > 0) {
            return expMsg("year", years.toString())
        } else if (remainingMonths > 0) {
            return expMsg("month", remainingMonths.toString());
        } else if (remainingDays > 0) {
            return expMsg("day", remainingDays.toString());
        }

        return expMsg("hour", hours.toString());
    }, [user, expMsg])

    return (
        <User
            name={<>
                {userMsg("subName")} <Translate as={"span"}>{user.full_name}</Translate>
            </>}
            description={userExp}
            avatarProps={{
                src: user.thumbnail || ""
            }}
            classNames={{
                base: "justify-start gap-x-6",
                name: "text-base font-medium",
                description: "text-sm text-default-500",
            }}
        />
    );
};

export default UserRoom;