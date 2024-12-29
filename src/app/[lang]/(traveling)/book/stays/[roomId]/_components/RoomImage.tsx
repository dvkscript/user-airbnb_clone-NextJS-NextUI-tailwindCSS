"use client"
import Image from "@/components/Common/Image";
import useDictionary from "@/hooks/useDictionary";
import { GetRoomDetail } from "@/services/room.service";
import React from "react"

interface RoomImageProps {
    room: GetRoomDetail;
}

const RoomImage: React.FC<RoomImageProps> = ({
    room
}) => {
    const subtitleMsg = useDictionary("book", d => d.image.subtitles).t;

    return (
        <div className="flex gap-x-4">
            <Image
                src={room.photos[0].url}
                alt={room.title || ""}
                width={104}
                height={104}
                radius="sm"
                classNames={{
                    wrapper: 'z-0'
                }}
            />
            <div>
                <p className="font-medium line-clamp-2">
                    {room.title}
                </p>
                <p
                    className="text-description-accent text-accent line-clamp-1"
                >
                    {subtitleMsg(room.privacy_type as any)}
                </p>
                <div className="h-5" />
            </div>
        </div>
    );
};

export default RoomImage;