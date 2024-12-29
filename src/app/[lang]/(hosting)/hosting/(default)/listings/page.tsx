import React from "react"
import ListingClient from "./ListingClient";
import { getUserRoomAndCountAll } from "@/services/user.service";

interface ListingPageProps { 
    searchParams: {
        q?: string;
    }
}

const ListingPage = async ({ 
    searchParams
}: ListingPageProps) => {
    const roomsRes = await getUserRoomAndCountAll(searchParams);
    if (!roomsRes.ok) {
        throw new Error(roomsRes.status.toString());
    };
    const { rows, count } = roomsRes.data! || {};
    return (
        <>
            <ListingClient rooms={rows} roomCount={count} />
        </>
    );
};

export default ListingPage;