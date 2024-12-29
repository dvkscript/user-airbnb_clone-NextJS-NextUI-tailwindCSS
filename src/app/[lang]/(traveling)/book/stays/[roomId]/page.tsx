import React from "react"
import BookClient from "./BookClient";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { getRoomDetail } from "@/services/room.service";
import { getHeaderValue } from "@/libs/next-headers";

interface PageProps {
    params: Params
}

const Page = async ({
    params
}: PageProps) => {
    const roomId = params.roomId;
    const lang = params.lang;
    const isAuthorization = getHeaderValue("isAuthorization")

    const roomRes = await getRoomDetail(roomId);
    
    if (!roomRes.ok) {
        throw new Error(roomRes.status.toString())
    }

    const room = roomRes.data!;

    return (
        <BookClient 
            lang={lang} 
            room={room}
            isAuthorization={isAuthorization}
        />
    );
};

export default Page;