"use client"
import Container from "@/components/Common/Container";
import { GetRoomAndCountAll } from "@/services/room.service";
import { cn } from "@/utils/dom.util";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState } from "react"
import RoomBox from "./_components/RoomBox";
import ModalWishlist from "@/components/Modal/ModalWishlist";
import { GetWishlists } from "@/services/user.service";
import { Pagination, Spacer } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import useUrl from "@/hooks/useUrl";
const MapSearch = dynamic(async () => await import("./_components/MapSearch"), {
    ssr: false
})

interface HomeClientProps {
    searchParams: Params;
    drawerOpen: boolean;
    rooms: GetRoomAndCountAll["rows"];
    wishlists: GetWishlists
    roomCount: number;
}

const HomeClient: React.FC<HomeClientProps> = ({
    searchParams,
    drawerOpen,
    rooms,
    wishlists,
    roomCount
}) => {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [roomSelected, setRoomSelected] = useState<GetRoomAndCountAll["rows"][number] | null>(null);
    const totalPage = useMemo(() => Math.ceil(roomCount / (Number(searchParams.limit) || 1)), [roomCount, searchParams.limit]);
    const router = useRouter();
    const { searchParamsRef } = useUrl()

    const handlePageChange = useCallback((page: number) => {
        const search = new URLSearchParams(searchParamsRef.current);
        search.set("page", `${page}`);
        router.push(`?${search.toString()}`, { scroll: true });
    }, [router, searchParamsRef])

    return (
        <>
            {
                searchParams.drawer_open && (
                    <MapSearch
                        rooms={rooms}
                        className={cn(
                            !drawerOpen && "hidden"
                        )}
                    />
                )
            }
            <Container
                className={cn(
                    "min-h-[1000px]",
                    drawerOpen && "hidden",
                )}
            >
                <div
                    className={cn(
                        "grid gap-6 py-4",
                        rooms.length < 6 ?
                            "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6" :
                            "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]"
                    )}
                >
                    {
                        rooms.map((room) => (
                            <RoomBox
                                room={room}
                                key={room.id}
                                isOpenModal={isOpenModal}
                                setIsOpenModal={setIsOpenModal}
                                roomSelected={roomSelected}
                                setRoomSelected={setRoomSelected}
                            />
                        ))
                    }
                </div>
                <Spacer y={6} />
                {
                    totalPage > 1 && (
                        <>
                            <div className="w-fit mx-auto z-0">
                                <Pagination
                                    color="primary"
                                    showControls
                                    initialPage={Math.min(totalPage, Math.max((Number(searchParams.page) || 1), 1))}
                                    total={Math.ceil(roomCount / (Number(searchParams.limit) || 1))}
                                    size="lg"
                                    variant="light"
                                    radius="md"
                                    onChange={handlePageChange}
                                />
                            </div>
                            <Spacer y={6} />
                        </>
                    )
                }
            </Container>
            <ModalWishlist
                wishlists={wishlists}
                isOpenModal={isOpenModal}
                setIsOpenModal={setIsOpenModal}
                roomSelected={roomSelected}
                setRoomSelected={setRoomSelected}
            />
        </>
    );
};

export default HomeClient;