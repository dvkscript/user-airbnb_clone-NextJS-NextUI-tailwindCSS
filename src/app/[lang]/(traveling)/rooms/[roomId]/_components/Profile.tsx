"use client"
import Button from "@/components/Button";
import useDictionary from "@/hooks/useDictionary";
import { GetRoomDetail } from "@/services/room.service";
import { Avatar, Card } from "@nextui-org/react";
import React, { useMemo } from "react"

interface ProfileProps {
    user: GetRoomDetail["user"];
}

const Profile: React.FC<ProfileProps> = ({
    user
}) => {
    const { t, d } = useDictionary("rooms", d => d.user);
    const btnMsg = useDictionary("common", d => d.buttons).t

    const startedDate = useMemo(() => {
        const now = new Date();
        const newDate = now.getTime() - user.exp;
        return new Date(newDate);
    }, [user.exp]);

    return (
        <section id="profile" className="py-[inherit]">
            <h2 className="text-subtitle pb-6">
                {t("title")}
            </h2>
            <div className="flex flex-col lg:flex-row items-start justify-start gap-16">
                <Card
                    className="w-[380px] h-[230px] justify-center items-center text-center gap-y-3"
                    radius="lg"
                >
                    <div>
                        <Avatar
                            src={user.thumbnail || ""}
                            alt={user.full_name}
                            radius="full"
                            className="h-[104px] w-[104px]"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold max-w-40 text-wrap line-clamp-2 leading-5">
                            {user.full_name}
                        </h3>
                        <span className="text-sm font-medium max-w-40 inline-block text-wrap line-clamp-2 mt-1">
                            {d?.experienced.started.replace("{{value}}", `${startedDate.getFullYear()}`)}
                        </span>
                    </div>
                </Card>
                <div className="flex-1 py-6">
                    <h3 className="font-medium pb-6">
                        {t("subtitle")}
                    </h3>
                    <div>
                        <Button
                            color="secondary"
                            radius="sm"
                            size="lg"
                            className="font-medium"
                        >
                            {btnMsg("Message Host")}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;